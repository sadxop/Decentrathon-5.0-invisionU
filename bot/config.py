import os
from typing import Final

from dotenv import load_dotenv


load_dotenv()

BOT_TOKEN: Final[str | None] = os.getenv("TELEGRAM_BOT_TOKEN")
API_URL: Final[str] = os.getenv("BACKEND_API_URL", "http://127.0.0.1:8000")
GROQ_API_KEY: Final[str | None] = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL: Final[str] = "https://api.groq.com/openai/v1"
GROQ_MODEL: Final[str] = "llama-3.3-70b-versatile"

