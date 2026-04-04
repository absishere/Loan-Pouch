import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────────────────
    APP_NAME: str = "Loan Pouch API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Firebase ──────────────────────────────────────────────────────────────
    # Path to the service account JSON downloaded from Firebase Console.
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase-service-account.json"
    FIREBASE_WEB_API_KEY: str = ""            # from Firebase Project Settings → General

    # ── Pinata (IPFS) ─────────────────────────────────────────────────────────
    PINATA_API_KEY: str = ""
    PINATA_API_SECRET: str = ""
    PINATA_BASE_URL: str = "https://api.pinata.cloud"

    # ── Blockchain ────────────────────────────────────────────────────────────
    # Local Hardhat: http://127.0.0.1:8545  |  Sepolia: from .env
    WEB3_RPC_URL: str = "http://127.0.0.1:8545"
    BACKEND_WALLET_PRIVATE_KEY: str = ""  # Deployer/Admin key for backend-signed txns

    # Contract addresses – filled in after your blockchain team deploys
    BINR_CONTRACT_ADDRESS: str = "0xF10Ce26e1ebc46c3248eFd4f7e129399dC6b780d"
    ESCROW_CONTRACT_ADDRESS: str = "0x1F85067f88b4597c5eE16Ec7fe9fD7C48910d978"

    # ABI files (auto-resolved from smart-contracts/artifacts)
    BINR_ABI_PATH: str = "../smart-contracts/artifacts/contracts/B_INR.sol/B_INR.json"
    ESCROW_ABI_PATH: str = "../smart-contracts/artifacts/contracts/LoanPouchEscrow.sol/LoanPouchEscrow.json"

    # ── Security ──────────────────────────────────────────────────────────────
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
