import json
import re

from openai import OpenAI

from .config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
    return _client


SYSTEM_PROMPT = """
Ты — Senior-эксперт приёмной комиссии inVision U.
Твоя цель: выявить настоящих будущих лидеров и "агентов изменений", а не просто отфильтровать сильные заявки.

КРИТЕРИИ ОЦЕНКИ (каждый от 0 до 25 баллов, итого 0–100):

1. Мотивация (0–25):
   - Глубина и конкретность: почему именно inVision U, а не просто "хочу учиться".
   - Личная история, связанная с выбором. Пустые клише снижают балл.

2. Лидерский потенциал (0–25):
   - Ищи глаголы действия: создал, организовал, запустил, решил, повёл.
   - Игнорируй пассивные фразы: участвовал, состоял, интересовался.
   - Опыт влияния на других людей — особенно ценен.

3. Траектория роста (0–25):
   - Контекст важнее результата: локальный проект из малого города ценнее пустой активности в мегаполисе.
   - Оценивай resilience: как кандидат преодолевал трудности, что вынес из неудач.
   - Динамика развития важнее текущего уровня достижений.

4. Аутентичность и риск GenAI (0–25):
   - "Стерильный" текст с клише (passion for excellence, synergy, game-changer) — снижай балл.
   - Живая, неидеальная, честная история с конкретными деталями — это максимум.
   - Признак GenAI: идеально структурированные абзацы, отсутствие личных деталей, универсальность.

МЕТКИ:
- Алмаз (85–100): исключительный кандидат, рекомендовать в первую очередь
- Лидер (70–84): сильный кандидат, рекомендовать
- Потенциал (50–69): перспективный, требует внимания комиссии
- Обычный (30–49): средний уровень, комиссия решает
- Риск GenAI (<30 или высокий риск): сомнительная заявка, требует ручной проверки

ПРАВИЛА:
- Будь критичен и справедлив. Не ставь максимум без весомых оснований.
- Отвечай СТРОГО в JSON. Язык rationale и всех объяснений — русский.
- Ссылайся на конкретные факты из анкеты в обосновании.

ФОРМАТ JSON (строго):
{
  "total_score": <число 0–100>,
  "breakdown": {
    "motivation": <0–25>,
    "leadership": <0–25>,
    "growth": <0–25>,
    "authenticity": <0–25>
  },
  "leadership_label": "<Алмаз|Лидер|Потенциал|Обычный|Риск GenAI>",
  "rationale": "<подробный разбор: сильные стороны, слабые стороны, конкретные факты из анкеты>",
  "recommendation": "<краткая рекомендация для комиссии (1–2 предложения)>"
}
"""

VALID_LABELS = {"Алмаз", "Лидер", "Потенциал", "Обычный", "Риск GenAI"}


def _depersonalize(text: str, full_name: str) -> str:
    if not full_name:
        return text
    return re.sub(re.escape(full_name.strip()), "[КАНДИДАТ]", text or "", flags=re.IGNORECASE)


def score_candidate(data: dict) -> dict:
    essay_parts = [
        f"Образование: {data.get('education', '—')}",
        f"Главное достижение: {data.get('achievement', '—')}",
        f"Трудности и преодоление: {data.get('challenge', '—')}",
        f"Лидерский опыт: {data.get('leadership', '—')}",
        f"Мотивация и видение будущего: {data.get('motivation', '—')}",
    ]
    essay = "\n".join(essay_parts)
    essay_safe = _depersonalize(essay, data.get("full_name", ""))

    user_content = (
        f"Имя: {data.get('full_name', '—')}\n"
        f"Город: {data.get('city', '—')}\n"
        f"Возраст: {data.get('age', '—')}\n\n"
        f"{essay_safe}"
    )

    try:
        response = _get_client().chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
    except Exception as exc:
        return {
            "total_score": 0,
            "breakdown": {"motivation": 0, "leadership": 0, "growth": 0, "authenticity": 0},
            "leadership_label": "Риск GenAI",
            "rationale": f"Ошибка AI-сервиса: {exc}",
            "recommendation": "Требуется ручная проверка.",
            "error": True,
        }

    score = max(0, min(int(parsed.get("total_score", 0) or 0), 100))
    breakdown = parsed.get("breakdown") or {}
    label = parsed.get("leadership_label", "Потенциал")
    if label not in VALID_LABELS:
        label = "Потенциал"

    return {
        "total_score": score,
        "breakdown": {
            "motivation": max(0, min(int(breakdown.get("motivation", 0) or 0), 25)),
            "leadership": max(0, min(int(breakdown.get("leadership", 0) or 0), 25)),
            "growth": max(0, min(int(breakdown.get("growth", 0) or 0), 25)),
            "authenticity": max(0, min(int(breakdown.get("authenticity", 0) or 0), 25)),
        },
        "leadership_label": label,
        "rationale": str(parsed.get("rationale", "")).strip() or "Недостаточно данных.",
        "recommendation": str(parsed.get("recommendation", "")).strip(),
        "error": False,
    }


def format_score_message(result: dict, full_name: str) -> str:
    score = result["total_score"]
    label = result["leadership_label"]
    bd = result["breakdown"]
    rationale = result["rationale"]
    recommendation = result["recommendation"]

    label_emoji = {
        "Алмаз": "💎",
        "Лидер": "🌟",
        "Потенциал": "🌱",
        "Обычный": "📋",
        "Риск GenAI": "⚠️",
    }.get(label, "📊")

    score_bar = _score_bar(score)

    lines = [
        f"🎓 *Результат анализа — inVision U*",
        f"",
        f"👤 Кандидат: {full_name}",
        f"",
        f"{label_emoji} *{label}* — {score}/100",
        f"{score_bar}",
        f"",
        f"📊 *Разбивка по критериям:*",
        f"• Мотивация:          {bd['motivation']}/25 {_mini_bar(bd['motivation'], 25)}",
        f"• Лидерский потенциал: {bd['leadership']}/25 {_mini_bar(bd['leadership'], 25)}",
        f"• Траектория роста:   {bd['growth']}/25 {_mini_bar(bd['growth'], 25)}",
        f"• Аутентичность:      {bd['authenticity']}/25 {_mini_bar(bd['authenticity'], 25)}",
        f"",
        f"📝 *Анализ комиссии:*",
        f"{rationale}",
    ]

    if recommendation:
        lines += ["", f"💡 *Рекомендация:* {recommendation}"]

    lines += [
        "",
        "─" * 30,
        "✅ Заявка передана комиссии inVision U.",
        "Мы свяжемся с тобой в ближайшее время!",
    ]

    return "\n".join(lines)


def _score_bar(score: int) -> str:
    filled = round(score / 10)
    empty = 10 - filled
    return "█" * filled + "░" * empty + f" {score}%"


def _mini_bar(val: int, max_val: int) -> str:
    filled = round((val / max_val) * 5)
    return "▓" * filled + "░" * (5 - filled)
