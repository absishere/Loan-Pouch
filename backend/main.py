from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import get_settings
from app.services.firebase_service import init_firebase

# Import all routers
from app.api import auth, kyc, loans, wallet

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# ── App initialization ─────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## Loan Pouch Backend API

Decentralized micro-lending platform API powering:
- 📱 KYC verification (OCR + Face Match)
- 🔐 Firebase OTP Authentication
- 📦 IPFS KYC metadata storage via Pinata
- ⛓️ Web3 bridge to BioLendEscrow smart contract
- 📊 AI risk scoring
- 🔒 Wallet security (SMS Lock, Panic Mode)
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allow Expo / React Native dev requests) ──────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup events ─────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_firebase()


# ── Routers (v1 — legacy / SDK clients) ───────────────────────────────────────
app.include_router(auth.router,   prefix="/api/v1")
app.include_router(kyc.router,    prefix="/api/v1")
app.include_router(loans.router,  prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")

# ── Routers (/api — Web & Mobile clients) ───────────────────────────────────
# Both frontend clients build: BASE_URL(/api) + /loans/... → /api/loans/...
app.include_router(auth.router,   prefix="/api")
app.include_router(kyc.router,    prefix="/api")
app.include_router(loans.router,  prefix="/api")
app.include_router(wallet.router, prefix="/api")


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }
