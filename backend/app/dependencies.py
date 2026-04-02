from app.config import settings


def get_api_key() -> str:
    return settings.CLAUDE_API_KEY
