from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://orchestrator_user:orchestrator_pass@localhost:5432/orchestrator"
    CLAUDE_API_KEY: str = ""
    JWT_SECRET_KEY: str = "dev-only-change-in-production"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    MOCK_MODE: bool = True

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
