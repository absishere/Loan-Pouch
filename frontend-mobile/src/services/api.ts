const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.0.2.2:8000/api";

export const CONTRACTS = {
  escrow: process.env.EXPO_PUBLIC_ESCROW_ADDRESS || "",
  binr: process.env.EXPO_PUBLIC_BINR_ADDRESS || "",
  rpcUrl: process.env.EXPO_PUBLIC_WEB3_RPC_URL || "",
  chainId: Number(process.env.EXPO_PUBLIC_CHAIN_ID) || 11155111,
};

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getLoan: (id: number) => req<LoanResponse>(`/loans/${id}`),
  listLoans: (skip = 0, limit = 20) => req<LoanResponse[]>(`/loans?skip=${skip}&limit=${limit}`),
  requestLoan: (payload: RequestLoanPayload) =>
    req<TxResponse>("/loans/request", { method: "POST", body: JSON.stringify(payload) }),
  fundLoan: (id: number, amount: number, lenderAddress: string) =>
    req<TxResponse>("/loans/fund", {
      method: "POST",
      body: JSON.stringify({ loan_id: id, amount, lender_address: lenderAddress }),
    }),
  repayLoan: (id: number, amount: number) =>
    req<TxResponse>("/loans/repay", {
      method: "POST",
      body: JSON.stringify({ loan_id: id, amount }),
    }),
  getRiskScore: (trustScore: number, loanAmount: number, durationDays: number) =>
    req<RiskResponse>("/loans/risk-score", {
      method: "POST",
      body: JSON.stringify({ trust_score: trustScore, loan_amount: loanAmount, duration_days: durationDays, guardian_count: 3 }),
    }),
};

export interface LoanResponse {
  id: number;
  target_amount: number;
  gathered_amount: number;
  target_interest: number;
  borrower: string;
  guardians: string[];
  approvals: number;
  rejections: number;
  state: number;
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

export type LoanData = LoanResponse;

export const LOAN_STATE_LABELS: Record<number, string> = {
  0: "Gathering",
  1: "Pending Guardian",
  2: "Disbursed",
  3: "Repaid",
  4: "Cancelled",
  5: "Defaulted",
};

export interface RequestLoanPayload {
  borrower_address: string;
  amount: number;
  interest_amount: number;
  guardians: string[];
  funding_deadline_days?: number;
}

export interface TxResponse { tx_hash: string; status: string; }
export interface RiskResponse { risk_label: string; risk_probability: number; }
