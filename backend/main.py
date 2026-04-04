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

# â”€â”€ App initialization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## Loan Pouch Backend API

Decentralized micro-lending platform API powering:
- ðŸ“± KYC verification (OCR + Face Match)
- ðŸ” Firebase OTP Authentication
- ðŸ“¦ IPFS KYC metadata storage via Pinata
- â›“ï¸ Web3 bridge to LoanPouchEscrow smart contract
- ðŸ“Š AI risk scoring
- ðŸ”’ Wallet security (SMS Lock, Panic Mode)
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# â”€â”€ CORS (allow Expo / React Native dev requests) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# â”€â”€ Startup events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@app.on_event("startup")
async def startup_event():
    logger.info(f"ðŸš€ Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_firebase()


# â”€â”€ Routers (v1 â€” legacy / SDK clients) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.include_router(auth.router,   prefix="/api/v1")
app.include_router(kyc.router,    prefix="/api/v1")
app.include_router(loans.router,  prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")

# â”€â”€ Routers (/api â€” Web & Mobile clients) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Both frontend clients build: BASE_URL(/api) + /loans/... â†’ /api/loans/...
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
