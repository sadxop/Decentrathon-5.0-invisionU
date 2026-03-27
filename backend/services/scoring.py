import os
import re
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Используем Groq-совместимый OpenAI-клиент
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

VALID_LABELS = {"Алмаз", "Лидер", "Потенциал", "Обычный", "Риск GenAI"}


def validate_candidate_data(data):
    essay = (data.essay or "").strip()
    if len(essay) < 50:
        return {
            "total_score": 0,
            "leadership_label": "Риск GenAI",
            "verdict": "Отказ (Пустое эссе)",
            "rationale": "Кандидат не предоставил достаточно информации для анализа.",
        }
    return None


def depersonalize_text(text: str, full_name: str) -> str:
    t = text or ""
    name = (full_name or "").strip()
    if name:
        t = re.sub(re.escape(name), "[REDACTED_NAME]", t, flags=re.IGNORECASE)
    return t


def evaluate_candidate(data):
    validation = validate_candidate_data(data)
    if validation is not None:
        return validation

    #инструкция для ии
    system_prompt = """
Ты — Senior-эксперт приемной комиссии университета inVision U. 
Твоя цель: найти будущих технологических лидеров и "агентов изменений".

ИНСТРУКЦИЯ ПО ОЦЕНКЕ:
1. Лидерский потенциал (0-40 баллов):
- Ищи глаголы действия (создал, организовал, запустил, решил).
- Игнорируй пассивные фразы (участвовал, состоял, интересовался).
- Особое внимание проектам, которые принесли пользу другим.

2. Траектория роста (0-40 баллов):
- Сравнивай достижения с контекстом. 
- Если кандидат из малого города/села и сделал локальный проект — это ценнее, чем "золотой ребенок" из мегаполиса с готовыми курсами.
- Оценивай преодоление трудностей (resilience).

3. Аутентичность и риск GenAI (0-20 баллов):
- Если текст слишком "стерильный", использует клише (passion for excellence, synergy, game-changer) — снижай балл.
- Живая, неидеальная, но честная история — это +20 баллов.

ПРАВИЛА ОТВЕТА:
- Ты должен вернуть ответ СТРОГО в формате JSON.
- Язык обоснования (rationale): Русский. 
- Будь критичен, но справедлив. Не ставь 100 баллов просто так.

СТРУКТУРА JSON:
{
  "total_score": <число от 0 до 100>,
  "leadership_label": "<одна из: Алмаз, Лидер, Потенциал, Обычный, Риск GenAI>",
  "rationale": "<подробный разбор сильных и слабых сторон на основе фактов из анкеты>"
}
"""

    essay_safe = depersonalize_text(data.essay, data.full_name)

    user_content = f"""
    Имя: {data.full_name}
    Город: {data.city}
    Эссе: {essay_safe}
    Достижения: {data.achievements}
    Лет опыта: {data.experience_years}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"}
        )
    except Exception:
        return {
            "total_score": 0,
            "leadership_label": "Риск GenAI",
            "verdict": "Ошибка внешнего LLM-сервиса",
            "rationale": "Не удалось получить ответ от LLM. Требуется повторить попытку позже или проверить ключ/API.",
        }
    try:
        parsed = json.loads(response.choices[0].message.content or "{}")
    except json.JSONDecodeError:
        return {
            "total_score": 0,
            "leadership_label": "Риск GenAI",
            "verdict": "Ошибка анализа",
            "rationale": "LLM вернула невалидный JSON. Требуется ручная проверка кандидата.",
        }

    score_raw = parsed.get("total_score", 0)
    try:
        score = int(score_raw)
    except (TypeError, ValueError):
        score = 0
    score = max(0, min(score, 100))

    label = parsed.get("leadership_label", "Потенциал")
    if label not in VALID_LABELS:
        label = "Потенциал"

    rationale = str(parsed.get("rationale", "")).strip()
    if not rationale:
        rationale = "Недостаточно объяснений от модели. Требуется ручная проверка."

    return {
        "total_score": score,
        "leadership_label": label,
        "rationale": rationale,
    }
