const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const CONTRACTS = {
  escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "",
  binr: process.env.NEXT_PUBLIC_BINR_ADDRESS || "",
  rpcUrl: process.env.NEXT_PUBLIC_WEB3_RPC_URL || "",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
};

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// --- Loan endpoints ---
export const api = {
  /** Get a loan by on-chain ID */
  getLoan: (id: number) => req<LoanResponse>(`/loans/${id}`),

  /** Get all on-chain loans (paginated) */
  listLoans: (skip = 0, limit = 20) =>
    req<LoanResponse[]>(`/loans?skip=${skip}&limit=${limit}`),

  /** Request a new loan */
  requestLoan: (payload: RequestLoanPayload) =>
    req<TxResponse>("/loans/request", { method: "POST", body: JSON.stringify(payload) }),

  /** Fund an existing loan (as lender) */
  fundLoan: (id: number, amount: number, lenderAddress: string) =>
    req<TxResponse>("/loans/fund", {
      method: "POST",
      body: JSON.stringify({ loan_id: id, amount, lender_address: lenderAddress }),
    }),

  /** Repay a loan */
  repayLoan: (id: number, amount: number) =>
    req<TxResponse>("/loans/repay", {
      method: "POST",
      body: JSON.stringify({ loan_id: id, amount }),
    }),

  /** Get AI risk score for a loan before creation */
  getRiskScore: (trustScore: number, loanAmount: number, durationDays: number) =>
    req<RiskResponse>("/loans/risk-score", {
      method: "POST",
      body: JSON.stringify({
        trust_score: trustScore,
        loan_amount: loanAmount,
        duration_days: durationDays,
        guardian_count: 3,
      }),
    }),

  /** Submit Zk-SNARK proof for high-value (>1M BINR) loans */
  submitZkProof: (walletAddress: string, proofBytes: string) =>
    req<ZkProofResponse>(
      `/loans/zk-proof?wallet_address=${walletAddress}&proof_bytes=${proofBytes}`,
      { method: "POST" }
    ),
};

// --- KYC endpoints ---
export const kyc = {
  uploadId: (formData: FormData, docType: "aadhaar" | "pan") =>
    fetch(`${BASE_URL}/kyc/upload-id?doc_type=${docType}`, { method: "POST", body: formData }).then(
      (r) => r.json()
    ),
  matchFace: (formData: FormData) =>
    fetch(`${BASE_URL}/kyc/face-match`, { method: "POST", body: formData }).then((r) => r.json()),
};

// --- Types ---
export interface LoanResponse {
  id: number;
  target_amount: number;
  gathered_amount: number;
  target_interest: number;
  borrower: string;
  guardians: string[];
  approvals: number;
  rejections: number;
  state: number; // 0=Gathering, 1=Pending, 2=Disbursed, 3=Repaid, 4=Cancelled, 5=Defaulted
  funding_deadline: number;
  guardian_deadline: number;
  repayment_deadline: number;
  total_repaid_amount: number;
  is_milestone: boolean;
  claimed_tranches: number;
  repaid_tranches: number;
  risk_label?: string;
  risk_probability?: number;
}

export type LoanState = "Gathering" | "Pending" | "Disbursed" | "Repaid" | "Cancelled" | "Defaulted";
export const LOAN_STATE_LABELS: Record<number, LoanState> = {
  0: "Gathering",
  1: "Pending",
  2: "Disbursed",
  3: "Repaid",
  4: "Cancelled",
  5: "Defaulted",
};

export interface RequestLoanPayload {
  borrower_address: string;
  amount: number;         // in wei (BINR has 18 decimals)
  interest_amount: number;
  guardians: string[];    // 3 guardian wallet addresses
  funding_deadline_days?: number;
}

export interface TxResponse { tx_hash: string; status: string; }
export interface ZkProofResponse { status: string; tx_hash: string; msg: string; }
export interface RiskResponse { risk_label: string; risk_probability: number; }
