from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./foodstore.db'
    SECRET_KEY: str = 'CAMBIAR_ESTA_CLAVE_DE_AL_MENOS_32_CARACTERES'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = 'http://localhost:5173'
    COOKIE_SECURE: bool = False
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

@lru_cache
def get_settings() -> Settings:
    return Settings()
