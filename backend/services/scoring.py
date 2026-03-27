import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Используем Groq-совместимый OpenAI-клиент
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def evaluate_candidate(data):
    #инструкция для ии
    system_prompt = """
    Ты - эксперт приемной комиссии университета inVision U. 
    Твоя задача: оценить потенциал кандидата.
    
    Критерии оценки (0-100):
    1. Лидерство: берет ли ответственность, ведет ли за собой?
    2. Траектория: насколько велик его прогресс относительно стартовых условий?
    3. Аутентичность: живой ли это голос или текст от ChatGPT?
    
    Верни ответ СТРОГО в формате JSON:
    {
        "total_score": int,
        "leadership_label": "строка (краткий статус)",
        "rationale": "подробное объяснение на русском языке"
    }
    """

    user_content = f"""
    Имя: {data.full_name}
    Город: {data.city}
    Эссе: {data.essay}
    Достижения: {data.achievements}
    Лет опыта: {data.experience_years}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        response_format={"type": "json_object"}
    )

    import json
    return json.loads(response.choices[0].message.content)
