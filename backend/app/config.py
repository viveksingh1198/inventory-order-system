from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://inventory:inventory@db:5432/inventory_db"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    LOW_STOCK_THRESHOLD: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
