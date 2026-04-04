"""
IPFS service via Pinata.
Uploads encrypted KYC metadata and returns the IPFS CID.
Sensitive images are NEVER persisted locally — bytes are processed in memory and discarded.
"""

import json
import logging
import requests
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

PINATA_PIN_URL = f"{settings.PINATA_BASE_URL}/pinning/pinJSONToIPFS"
PINATA_FILE_URL = f"{settings.PINATA_BASE_URL}/pinning/pinFileToIPFS"


def _pinata_headers() -> dict:
    return {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_API_SECRET,
    }


def pin_kyc_metadata(kyc_data: dict, wallet_address: str) -> str:
    """
    Pins KYC metadata JSON to IPFS via Pinata.
    `kyc_data` should contain only non-sensitive extracted fields (name, DOB, masked ID).
    Raw document images must NOT be passed here — only hashes.

    Returns: IPFS CID string (e.g., "QmXyz...")
    """
    payload = {
        "pinataContent": {
            "wallet": wallet_address,
            **kyc_data
        },
        "pinataMetadata": {
            "name": f"kyc_{wallet_address[:10]}",
            "keyvalues": {"type": "kyc", "platform": "loanpouch"}
        }
    }

    response = requests.post(PINATA_PIN_URL, json=payload, headers=_pinata_headers(), timeout=15)
    response.raise_for_status()
    cid = response.json()["IpfsHash"]
    logger.info(f"✅ KYC metadata pinned to IPFS: {cid}")
    return cid


def pin_file_to_ipfs(file_bytes: bytes, filename: str) -> str:
    """
    Pins a raw file (e.g., encrypted face embedding) to IPFS.
    Returns the CID. Use sparingly — prefer pinning JSON metadata.
    """
    files = {
        "file": (filename, file_bytes, "application/octet-stream")
    }
    response = requests.post(PINATA_FILE_URL, files=files, headers=_pinata_headers(), timeout=30)
    response.raise_for_status()
    cid = response.json()["IpfsHash"]
    logger.info(f"✅ File pinned to IPFS: {cid}")
    return cid


def get_ipfs_gateway_url(cid: str) -> str:
    """Return a public gateway URL for a given CID."""
    return f"https://gateway.pinata.cloud/ipfs/{cid}"
