"""KYC endpoints: document OCR extraction and face matching."""
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.kyc_service import match_face
from app.services.ipfs_service import pin_kyc_metadata
from app.services.gemini_ocr_service import extract_document_with_gemini

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.post("/extract-aadhaar", summary="OCR extract details from Aadhaar image")
async def api_extract_aadhaar(file: UploadFile = File(...)):
    """
    Accepts an uploaded Aadhaar image and returns extracted fields.
    Image is processed in-memory and NOT stored anywhere.
    """
    image_bytes = await file.read()
    try:
        result = extract_document_with_gemini(
            image_bytes=image_bytes,
            mime_type=file.content_type or "image/jpeg",
            doc_type="aadhaar",
        )
        return {"status": "extracted", "doc_type": "aadhaar", "data": result, "manual_entry_allowed": False}
    except Exception as gemini_error:
        logger.warning("Gemini OCR failed for Aadhaar: %s", gemini_error)
        raise HTTPException(
            status_code=422,
            detail="Gemini OCR failed. Please enter Aadhaar details manually and continue face verification.",
        )


@router.post("/extract-pan", summary="OCR extract details from PAN card image")
async def api_extract_pan(file: UploadFile = File(...)):
    """
    Accepts an uploaded PAN image and returns extracted fields.
    Image is processed in-memory and NOT stored anywhere.
    """
    image_bytes = await file.read()
    try:
        result = extract_document_with_gemini(
            image_bytes=image_bytes,
            mime_type=file.content_type or "image/jpeg",
            doc_type="pan",
        )
        return {"status": "extracted", "doc_type": "pan", "data": result, "manual_entry_allowed": False}
    except Exception as gemini_error:
        logger.warning("Gemini OCR failed for PAN: %s", gemini_error)
        raise HTTPException(
            status_code=422,
            detail="Gemini OCR failed. Please enter PAN details manually.",
        )


@router.post("/match-face", summary="Match live selfie against document photo")
async def api_match_face(
    selfie: UploadFile = File(..., description="Live camera selfie"),
    document: UploadFile = File(..., description="Document photo (Aadhaar/PAN)")
):
    """
    Compares live selfie vs document photo.
    Neither image is stored — only the match result is returned.
    """
    selfie_bytes = await selfie.read()
    doc_bytes = await document.read()
    result = match_face(doc_bytes, selfie_bytes)

    if not result["is_match"]:
        raise HTTPException(
            status_code=422,
            detail=f"Face mismatch. Confidence: {result['confidence']:.0%}. Please try again."
        )
    return {"status": "matched", **result}


@router.post("/complete", summary="Finalize KYC: pin metadata to IPFS and return CID")
async def api_complete_kyc(
    wallet_address: str = Form(...),
    name: str = Form(...),
    dob: str = Form(...),
    masked_aadhaar: str = Form(...),
    pan_number: str = Form(...),
    phone: str = Form(...),
    face_confidence: float = Form(...),
):
    """
    Called after OCR + face match succeed.
    Packages the verified (non-sensitive) KYC metadata and pins it to IPFS.
    Returns the IPFS CID that should be stored on-chain by the frontend.
    """
    kyc_data = {
        "name": name,
        "dob": dob,
        "masked_aadhaar": masked_aadhaar,
        "pan_number": pan_number,
        "phone": phone,
        "face_confidence": face_confidence,
        "kyc_status": "verified",
    }
    try:
        cid = pin_kyc_metadata(kyc_data, wallet_address)
        return {
            "status": "kyc_complete",
            "ipfs_cid": cid,
            "ipfs_url": f"https://gateway.pinata.cloud/ipfs/{cid}"
        }
    except Exception as e:
        logger.error(f"KYC pinning failed: {e}")
        raise HTTPException(status_code=500, detail=f"IPFS pinning failed: {str(e)}")
