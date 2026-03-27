# Decentrathon-5.0-invisionU
Система  отбора кандидатов на базе ИИ для inVision U

- Система использует механизм деперсонализации данных перед отправкой в LLM для защиты приватности.

## Docker запуск (одинаково на всех устройствах)

1. Создай `.env` в корне (можно скопировать из `.env.example`) и заполни `GROQ_API_KEY`.
2. Запусти:
   - `docker compose up --build`
3. Swagger будет доступен по адресу:
   - `http://127.0.0.1:8000/docs`

### Полезные команды

- Остановить контейнер:
  - `docker compose down`
- Пересобрать после изменений:
  - `docker compose up --build`

## Telegram-бот (MVP)

Бот собирает анкету кандидата в диалоге и отправляет её в backend API (`/api/v1/analyze`).

### Быстрый запуск

1. Заполни `.env`:
   - `TELEGRAM_BOT_TOKEN=...`
   - `BACKEND_API_URL=http://127.0.0.1:8000/api/v1`
2. Установи зависимости бота:
   - `pip install -r bot/requirements.txt`
3. Запусти бота:
   - `python bot/main.py`

Команды в Telegram:
- `/start` — начать заполнение анкеты
- `/status` — проверить текущий статус заявки
- `/cancel` — отменить текущую анкету
