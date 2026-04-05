"""Web3 helpers for Loan Pouch backend."""

import json
import logging
from pathlib import Path

from web3 import Web3

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

w3: Web3 = Web3(Web3.HTTPProvider(settings.WEB3_RPC_URL))
if w3.is_connected():
    logger.info("Web3 connected to %s (chain id: %s)", settings.WEB3_RPC_URL, w3.eth.chain_id)
else:
    logger.warning("Web3 could not connect to %s", settings.WEB3_RPC_URL)


def _load_abi(path: str) -> list:
    artifact_path = Path(__file__).parent.parent.parent / path
    with open(artifact_path, encoding="utf-8") as f:
        return json.load(f)["abi"]


def get_escrow_contract():
    abi = _load_abi(settings.ESCROW_ABI_PATH)
    return w3.eth.contract(
        address=Web3.to_checksum_address(settings.ESCROW_CONTRACT_ADDRESS),
        abi=abi,
    )


def get_binr_contract():
    abi = _load_abi(settings.BINR_ABI_PATH)
    return w3.eth.contract(
        address=Web3.to_checksum_address(settings.BINR_CONTRACT_ADDRESS),
        abi=abi,
    )


def get_identity_registry_contract():
    if not settings.IDENTITY_REGISTRY_CONTRACT_ADDRESS:
        return None
    abi = _load_abi(settings.IDENTITY_REGISTRY_ABI_PATH)
    return w3.eth.contract(
        address=Web3.to_checksum_address(settings.IDENTITY_REGISTRY_CONTRACT_ADDRESS),
        abi=abi,
    )


def get_trust_score(wallet_address: str) -> int:
    try:
        contract = get_escrow_contract()
        score = contract.functions.trustScores(Web3.to_checksum_address(wallet_address)).call()
        return int(score)
    except Exception as e:
        logger.error("get_trust_score error: %s", e)
        return 0


def get_loan(loan_id: int) -> dict:
    try:
        contract = get_escrow_contract()
        loan = contract.functions.loans(loan_id).call()
        if len(loan) >= 16:
            return {
                "id": loan[0],
                "target_amount": loan[1],
                "gathered_amount": loan[2],
                "target_interest": loan[3],
                "borrower": loan[4],
                "guardians": list(loan[5]),
                "approvals": loan[6],
                "rejections": loan[7],
                "state": loan[8],
                "funding_deadline": loan[9],
                "guardian_deadline": loan[10],
                "repayment_deadline": loan[11],
                "total_repaid_amount": loan[12],
                "is_milestone": loan[13],
                "claimed_tranches": loan[14],
                "repaid_tranches": loan[15],
            }
        if len(loan) == 8:
            return {
                "id": loan_id,
                "target_amount": int(loan[2]),
                "gathered_amount": int(loan[3]),
                "target_interest": 0,
                "borrower": loan[0],
                "guardians": [],
                "approvals": 0,
                "rejections": 0,
                "state": int(loan[7]),
                "funding_deadline": int(loan[5]),
                "guardian_deadline": 0,
                "repayment_deadline": int(loan[5]),
                "total_repaid_amount": int(loan[4]),
                "is_milestone": False,
                "claimed_tranches": 0,
                "repaid_tranches": 0,
            }
        return {}
    except Exception as e:
        logger.error("get_loan error: %s", e)
        return {}


def get_all_loans() -> list[dict]:
    try:
        contract = get_escrow_contract()
        next_id = contract.functions.nextLoanId().call()
        loans = []
        for i in range(0, next_id):
            loan = get_loan(i)
            if loan and loan.get("target_amount", 0) > 0:
                loans.append(loan)
        return loans
    except Exception as e:
        logger.error("get_all_loans error: %s", e)
        return []


def is_wallet_locked(wallet_address: str) -> bool:
    try:
        contract = get_escrow_contract()
        return contract.functions.isLocked(Web3.to_checksum_address(wallet_address)).call()
    except Exception as e:
        logger.error("is_wallet_locked error: %s", e)
        return False


def _sign_and_send(fn_call) -> str:
    account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
    tx = fn_call.build_transaction(
        {
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 400_000,
            "gasPrice": w3.eth.gas_price,
        }
    )
    signed = w3.eth.account.sign_transaction(tx, settings.BACKEND_WALLET_PRIVATE_KEY)
    raw_tx = getattr(signed, "raw_transaction", None)
    if raw_tx is None:
        raw_tx = getattr(signed, "rawTransaction")
    tx_hash = w3.eth.send_raw_transaction(raw_tx)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    return receipt.transactionHash.hex()


def set_wallet_lock(wallet_address: str, lock_status: bool) -> str:
    contract = get_escrow_contract()
    fn = contract.functions.setWalletLock(Web3.to_checksum_address(wallet_address), lock_status)
    return _sign_and_send(fn)


def mark_loan_default(loan_id: int) -> str:
    contract = get_escrow_contract()
    fn = contract.functions.markDefault(loan_id)
    return _sign_and_send(fn)


def request_loan_via_backend(
    target_amount_wei: int,
    target_interest_wei: int,
    guardians: list[str],
    funding_duration_secs: int,
    repayment_duration_secs: int,
) -> str:
    contract = get_escrow_contract()
    g = [Web3.to_checksum_address(x) for x in guardians]
    if len(g) < 3:
        raise ValueError("Exactly 3 guardians required")
    request_fn_abi = contract.get_function_by_name("requestLoan").abi
    request_arity = len(request_fn_abi.get("inputs", []))
    if request_arity == 5:
        fn = contract.functions.requestLoan(
            int(target_amount_wei),
            int(target_interest_wei),
            g[:3],
            int(funding_duration_secs),
            int(repayment_duration_secs),
        )
    elif request_arity == 3:
        fn = contract.functions.requestLoan(
            int(target_amount_wei),
            int(target_interest_wei),
            g[:3],
        )
    else:
        raise RuntimeError(f"Unsupported requestLoan signature arity: {request_arity}")
    return _sign_and_send(fn)


def _approve_binr_if_needed(owner_address: str, required_amount: int) -> None:
    binr = get_binr_contract()
    escrow = Web3.to_checksum_address(settings.ESCROW_CONTRACT_ADDRESS)
    allowance = binr.functions.allowance(owner_address, escrow).call()
    if allowance >= required_amount:
        return
    approve_amount = max(required_amount, 10_000_000 * 10**18)
    fn = binr.functions.approve(escrow, approve_amount)
    _sign_and_send(fn)


def fund_loan_via_backend(loan_id: int, fund_amount_wei: int) -> str:
    account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
    _approve_binr_if_needed(account.address, int(fund_amount_wei))
    contract = get_escrow_contract()
    fund_fn_abi = contract.get_function_by_name("fundLoan").abi
    fund_arity = len(fund_fn_abi.get("inputs", []))
    if fund_arity == 2:
        fn = contract.functions.fundLoan(int(loan_id), int(fund_amount_wei))
    elif fund_arity == 1:
        fn = contract.functions.fundLoan(int(loan_id))
    else:
        raise RuntimeError(f"Unsupported fundLoan signature arity: {fund_arity}")
    return _sign_and_send(fn)


def repay_loan_via_backend(loan_id: int, repay_allowance_hint_wei: int = 1_000_000 * 10**18) -> str:
    account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
    _approve_binr_if_needed(account.address, int(repay_allowance_hint_wei))
    contract = get_escrow_contract()
    repay_fn_abi = contract.get_function_by_name("repayLoan").abi
    repay_arity = len(repay_fn_abi.get("inputs", []))
    if repay_arity == 1:
        fn = contract.functions.repayLoan(int(loan_id))
    elif repay_arity == 2:
        fn = contract.functions.repayLoan(int(loan_id), int(repay_allowance_hint_wei))
    else:
        raise RuntimeError(f"Unsupported repayLoan signature arity: {repay_arity}")
    return _sign_and_send(fn)


def register_identity_commitment(wallet: str, phone_hash_hex: str, doc_hash_hex: str, commitment_hex: str) -> str | None:
    """
    Persist uniqueness commitment on-chain if IdentityRegistry is configured.
    Returns tx hash, or None when registry is not configured.
    """
    contract = get_identity_registry_contract()
    if contract is None:
        return None

    fn = contract.functions.registerIdentity(
        Web3.to_checksum_address(wallet),
        Web3.to_bytes(hexstr=phone_hash_hex),
        Web3.to_bytes(hexstr=doc_hash_hex),
        Web3.to_bytes(hexstr=commitment_hex),
    )
    return _sign_and_send(fn)


def get_wallet_by_phone_hash(phone_hash_hex: str) -> str | None:
    contract = get_identity_registry_contract()
    if contract is None:
        return None
    wallet = contract.functions.phoneHashToWallet(Web3.to_bytes(hexstr=phone_hash_hex)).call()
    if wallet and int(wallet, 16) != 0:
        return wallet
    return None


def get_wallet_by_doc_hash(doc_hash_hex: str) -> str | None:
    contract = get_identity_registry_contract()
    if contract is None:
        return None
    wallet = contract.functions.docHashToWallet(Web3.to_bytes(hexstr=doc_hash_hex)).call()
    if wallet and int(wallet, 16) != 0:
        return wallet
    return None

