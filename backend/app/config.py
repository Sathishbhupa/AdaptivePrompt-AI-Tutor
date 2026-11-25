from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to the backend folder so it loads no matter where uvicorn is started from.
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    supabase_url: str = ''
    supabase_service_role_key: str = ''
    supabase_jwt_secret: str = ''
    cors_origins: str = 'http://localhost:3000'
    gemini_api_key: str = ''
    groq_api_key: str = ''
    gemini_small_model: str = 'gemini-3.5-flash-lite'
    gemini_tutor_model: str = 'gemini-3.8-flash'
    groq_small_model: str = 'openai/gpt-oss-20b'
    groq_tutor_model: str = 'openai/gpt-oss-120b'
    model_config = SettingsConfigDict(env_file=str(ENV_FILE), extra='ignore')

    @field_validator('supabase_url', 'supabase_service_role_key', 'supabase_jwt_secret', mode='before')
    @classmethod
    def _clean(cls, v):
        # Stray quotes/spaces/trailing slashes in .env are a common cause of 401s and connection errors.
        return str(v or '').strip().strip('"').strip("'").strip()

    @field_validator('supabase_url')
    @classmethod
    def _no_trailing_slash(cls, v: str) -> str:
        return v.rstrip('/')


settings = Settings()
