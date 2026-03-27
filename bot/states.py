from aiogram.fsm.state import State, StatesGroup


class CandidateForm(StatesGroup):
    full_name = State()
    city = State()
    age = State()
    education = State()
    achievement = State()
    challenge = State()
    leadership = State()
    motivation = State()

