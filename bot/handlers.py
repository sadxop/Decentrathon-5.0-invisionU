import asyncio

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from .api_client import get_candidate_status, submit_candidate
from .config import API_URL
from .groq_scorer import format_score_message, score_candidate
from .states import CandidateForm
from .validators import normalize_whitespace

router = Router()

WELCOME = (
    "👋 Привет! Я — AI-ассистент приёмной комиссии *inVision U*.\n\n"
    "Я задам тебе 8 вопросов, чтобы составить живой профиль кандидата.\n"
    "После этого наш AI проанализирует твои ответы и ты сразу увидишь результат.\n\n"
    "⏱ Займёт около 5–10 минут. Отвечай честно и развёрнуто — это важно!\n\n"
    "Напиши /cancel в любой момент, чтобы прервать.\n\n"
    "━━━━━━━━━━━━━━━━━━━━\n"
    "📝 *Шаг 1/8 — Регистрация*\n\n"
    "Как тебя зовут? *(ФИО полностью)*"
)

_MIN_ANSWER = 5
_NOT_CMD = ~F.text.startswith("/")


# ── Команды регистрируем ПЕРВЫМИ — они имеют приоритет над FSM-хендлерами ──

@router.message(Command("start"))
async def start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(WELCOME, parse_mode="Markdown")
    await state.set_state(CandidateForm.full_name)


@router.message(Command("cancel"))
async def cancel(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("❌ Анкета отменена. Напиши /start чтобы начать заново.")


@router.message(Command("status"))
async def status(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    candidate_id = data.get("last_candidate_id")
    if not candidate_id:
        await message.answer(
            "📭 Пока нет активной заявки. Напиши /start чтобы заполнить анкету."
        )
        return

    try:
        response = await get_candidate_status(API_URL, candidate_id)
        if response.status_code != 200:
            await message.answer("⏳ Заявка на обработке. Попробуй чуть позже.")
            return

        result = response.json()
        decision = result.get("final_decision")
        admin_note = (result.get("admin_note") or "").strip()
        if decision == "Approved":
            interview_text = admin_note or "дата уточняется"
            await message.answer(
                f"🎉 Твоя заявка прошла первичный скрининг!\n"
                f"📅 Интервью назначено на: {interview_text}"
            )
            return
        if decision == "Rejected":
            await message.answer(
                "Спасибо за участие! Комиссия завершила рассмотрение заявки."
            )
            return
        await message.answer("⏳ Заявка на рассмотрении. Комиссия скоро её проверит.")
    except Exception as exc:
        await message.answer("❌ Не получилось получить статус. Попробуй чуть позже.")
        print(f"Bot status error: {exc}")


# ── FSM-хендлеры ──

@router.message(CandidateForm.full_name, F.text, _NOT_CMD)
async def set_full_name(message: Message, state: FSMContext) -> None:
    name = normalize_whitespace(message.text or "")
    if len(name) < 5:
        await message.answer("✏️ Напиши ФИО полностью, пожалуйста.")
        return
    await state.update_data(full_name=name)
    await message.answer(
        f"Приятно познакомиться, {name.split()[0]}! 🙌\n\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 2/8*\n\n"
        "Из какого ты города?",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.city)


@router.message(CandidateForm.city, F.text, _NOT_CMD)
async def set_city(message: Message, state: FSMContext) -> None:
    city = normalize_whitespace(message.text or "")
    if len(city) < 2:
        await message.answer("✏️ Укажи город корректно, пожалуйста.")
        return
    await state.update_data(city=city)
    await message.answer(
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 3/8*\n\n"
        "Сколько тебе лет?",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.age)


@router.message(CandidateForm.age, F.text, _NOT_CMD)
async def set_age(message: Message, state: FSMContext) -> None:
    age_raw = (message.text or "").strip()
    if not age_raw.isdigit():
        await message.answer("✏️ Возраст должен быть числом. Попробуй ещё раз.")
        return
    age = int(age_raw)
    if age < 14 or age > 35:
        await message.answer("✏️ Укажи возраст в диапазоне 14–35.")
        return
    await state.update_data(age=age)
    await message.answer(
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 4/8*\n\n"
        "Где ты учишься сейчас?\n"
        "_Укажи учебное заведение и класс/курс. Например: «10 класс, школа №5, Алматы» "
        "или «2 курс, КазНУ, специальность IT»_",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.education)


@router.message(CandidateForm.education, F.text, _NOT_CMD)
async def set_education(message: Message, state: FSMContext) -> None:
    answer = normalize_whitespace(message.text or "")
    if len(answer) < 3:
        await message.answer("✏️ Укажи учебное заведение подробнее.")
        return
    await state.update_data(education=answer)
    await message.answer(
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 5/8 — Достижение*\n\n"
        "Расскажи о самом значимом проекте или деле, которое ты довёл до конца.\n\n"
        "_Не важен масштаб — важна твоя роль. Это может быть школьный проект, "
        "организация мероприятия, помощь кому-то или собственная инициатива._",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.achievement)


@router.message(CandidateForm.achievement, F.text, _NOT_CMD)
async def set_achievement(message: Message, state: FSMContext) -> None:
    answer = normalize_whitespace(message.text or "")
    if len(answer) < _MIN_ANSWER:
        await message.answer("✏️ Напиши хотя бы пару слов — AI не может оценить пустой ответ.")
        return
    await state.update_data(achievement=answer)
    await message.answer(
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 6/8 — Вызов*\n\n"
        "Опиши самый сложный вызов или неудачу в своей жизни.\n\n"
        "_Как ты с этим справился? Что понял о себе? "
        "Честность ценится больше красивой истории._",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.challenge)


@router.message(CandidateForm.challenge, F.text, _NOT_CMD)
async def set_challenge(message: Message, state: FSMContext) -> None:
    answer = normalize_whitespace(message.text or "")
    if len(answer) < _MIN_ANSWER:
        await message.answer("✏️ Напиши хотя бы пару слов — AI не может оценить пустой ответ.")
        return
    await state.update_data(challenge=answer)
    await message.answer(
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 7/8 — Лидерство*\n\n"
        "Был ли момент, когда ты повёл за собой других или запустил что-то новое?\n\n"
        "_Расскажи: что ты инициировал, кого вовлёк, к чему это привело. "
        "Если такого опыта ещё не было — опиши, чем бы ты хотел заниматься._",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.leadership)


@router.message(CandidateForm.leadership, F.text, _NOT_CMD)
async def set_leadership(message: Message, state: FSMContext) -> None:
    answer = normalize_whitespace(message.text or "")
    if len(answer) < _MIN_ANSWER:
        await message.answer("✏️ Напиши хотя бы пару слов — AI не может оценить пустой ответ.")
        return
    await state.update_data(leadership=answer)
    await message.answer(
        "━━━━━━━━━━━━━━━━━━━━\n"
        "📝 *Шаг 8/8 — Мотивация и видение*\n\n"
        "Последний вопрос, самый важный! 🎯\n\n"
        "Почему именно *ты* должен получить 100% грант inVision U?\n"
        "И что ты хочешь изменить или создать в мире через 5–10 лет?",
        parse_mode="Markdown",
    )
    await state.set_state(CandidateForm.motivation)


@router.message(CandidateForm.motivation, F.text, _NOT_CMD)
async def submit(message: Message, state: FSMContext) -> None:
    motivation = normalize_whitespace(message.text or "")
    if len(motivation) < _MIN_ANSWER:
        await message.answer("✏️ Напиши хотя бы пару слов — AI не может оценить пустой ответ.")
        return
    await state.update_data(motivation=motivation)
    data = await state.get_data()

    await message.answer(
        "✅ Анкета заполнена! Отлично!\n\n"
        "🤖 *AI-анализ запущен...* Это займёт 10–20 секунд.",
        parse_mode="Markdown",
    )

    result = await asyncio.get_event_loop().run_in_executor(
        None, score_candidate, data
    )

    score_msg = format_score_message(result, data["full_name"])
    await message.answer(score_msg, parse_mode="Markdown")

    profile_text = (
        f"Образование: {data.get('education', '—')}\n"
        f"Достижение: {data.get('achievement', '—')}\n"
        f"Вызов: {data.get('challenge', '—')}\n"
        f"Лидерство: {data.get('leadership', '—')}\n"
        f"Мотивация: {data.get('motivation', '—')}"
    )
    payload = {
        "full_name": data["full_name"],
        "city": data["city"],
        "essay": profile_text,
        "achievements": data.get("achievement", ""),
        "experience_years": max(0, int(data.get("age", 16)) - 16),
        "telegram_id": message.from_user.id if message.from_user else None,
    }

    try:
        response = await submit_candidate(API_URL, payload)
        if response.status_code == 200:
            res = response.json()
            await state.update_data(last_candidate_id=res.get("candidate_id"))
    except Exception as exc:
        print(f"Bot backend submit error: {exc}")

    await state.clear()


# ── Fallback ──

@router.message(F.text)
async def fallback(message: Message) -> None:
    await message.answer(
        "Напиши /start чтобы начать анкету или /status для проверки статуса."
    )

