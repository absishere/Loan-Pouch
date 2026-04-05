import os
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Loan Pouch API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "y", "on", "debug"}:
                return True
            if normalized in {"0", "false", "no", "n", "off", "release", "prod", "production"}:
                return False
        return True

    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase-service-account.json"
    FIREBASE_WEB_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    PAYMENT_MODE: str = "mock"

    PINATA_API_KEY: str = ""
    PINATA_API_SECRET: str = ""
    PINATA_BASE_URL: str = "https://api.pinata.cloud"

    WEB3_RPC_URL: str = "http://127.0.0.1:8545"
    BACKEND_WALLET_PRIVATE_KEY: str = ""

    BINR_CONTRACT_ADDRESS: str = "0x65E0a7226ECdCB7C47b5F998A98f1c55B42102AA"
    ESCROW_CONTRACT_ADDRESS: str = "0x2E28542574ec5F7b75c0264f590eE21C59F3cD57"
    IDENTITY_REGISTRY_CONTRACT_ADDRESS: str = ""

    BINR_ABI_PATH: str = "../smart-contracts/artifacts/contracts/B_INR.sol/B_INR.json"
    ESCROW_ABI_PATH: str = "../smart-contracts/artifacts/contracts/LoanPouchEscrow.sol/LoanPouchEscrow.json"
    IDENTITY_REGISTRY_ABI_PATH: str = "../smart-contracts/artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json"

    JWT_SECRET_KEY: str = "changeme-use-a-secure-random-string-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

