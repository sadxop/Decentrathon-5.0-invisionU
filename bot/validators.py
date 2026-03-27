import re


DIRTY_HINT = (
    "Кажется, этого маловато, чтобы комиссия тебя оценила. "
    "Попробуй расписать подробнее свои мысли."
)
BAD_WORDS = {"хуй", "пизд", "еба", "нахуй", "бля"}


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def looks_dirty_answer(text: str) -> bool:
    s = (text or "").strip().lower()
    if len(s) < 20:
        return True
    words = [w for w in re.split(r"\s+", s) if w]
    if len(words) < 4:
        return True
    if len(set(words)) <= 1:
        return True
    return any(bad in s for bad in BAD_WORDS)

