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
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      const raw = body?.detail;
      if (typeof raw === "string") {
        detail = ` - ${raw}`;
      } else if (Array.isArray(raw)) {
        const flat = raw.map((x) => (typeof x === "string" ? x : x?.msg || JSON.stringify(x))).join("; ");
        detail = flat ? ` - ${flat}` : "";
      } else if (raw) {
        detail = ` - ${JSON.stringify(raw)}`;
      }
    } catch {
      // ignore
    }
    throw new Error(`API ${path} failed: ${res.status}${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getLoan: (id: number) => req<LoanResponse>(`/loans/${id}`),
  listLoans: (skip = 0, limit = 20) => req<LoanResponse[]>(`/loans?skip=${skip}&limit=${limit}`),
  getLoanSnapshot: () => req<LoanSnapshot>("/loans/snapshot"),

  requestLoan: (payload: RequestLoanPayload) =>
    req<TxResponse>("/loans/request", { method: "POST", body: JSON.stringify(payload) }),

  fundLoan: (id: number, amount: number | string, lenderAddress: string) =>
    req<TxResponse>("/loans/fund", {
      method: "POST",
      body: JSON.stringify({ loan_id: id, amount, lender_address: lenderAddress }),
    }),

  repayLoan: (id: number, amount: number | string) =>
    req<TxResponse>("/loans/repay", {
      method: "POST",
      body: JSON.stringify({ loan_id: id, amount }),
    }),

  getRiskScore: (trustScore: number, loanAmount: number, durationDays: number, borrowerWallet?: string) =>
    req<RiskResponse>("/loans/risk-score", {
      method: "POST",
      body: JSON.stringify({
        borrower_wallet: borrowerWallet ?? null,
        trust_score: trustScore,
        loan_amount: loanAmount,
        duration_days: durationDays,
        guardian_count: 3,
      }),
    }),

  getPendingGuaranterLoans: (wallet: string) => req<PendingVoteLoan[]>(`/loans/guaranter/pending/${wallet}`),
  voteAsGuaranter: (loan_id: number, guaranter_wallet: string, approve: boolean) =>
    req<{ status: string }>("/loans/guaranter/vote", {
      method: "POST",
      body: JSON.stringify({ loan_id, guaranter_wallet, approve }),
    }),
};

export const auth = {
  sendOtp: (phoneNumber: string) =>
    req<{ status: string; session_info: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone_number: phoneNumber }),
    }),

  verifyOtp: (sessionInfo: string, otpCode: string) =>
    req<{ status: string; id_token: string; phone_number: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ session_info: sessionInfo, otp_code: otpCode }),
    }),

  registerUser: (payload: RegisterUserPayload) =>
    req<RegisterUserResponse>("/auth/register-user", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  loginUser: (phone: string, mpin: string) =>
    req<{ status: string; user: { name: string; phoneLast4: string; trustScore: number; walletAddress: string } }>(
      "/auth/login-user",
      {
        method: "POST",
        body: JSON.stringify({ phone, mpin }),
      }
    ),

  initRecovery: (payload: { phone: string; mpin: string; lost_wallet: string; new_wallet: string; guaranters: string[] }) =>
    req<{ status: string; request_id: number }>("/auth/recovery/init", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPendingRecoveryForGuaranter: (guaranterWallet: string) =>
    req<
      Array<{
        id: number;
        lost_wallet: string;
        new_wallet: string;
        approval_count: number;
        rejection_count: number;
        has_voted: boolean;
      }>
    >(`/auth/recovery/guaranter/pending/${guaranterWallet}`),

  voteRecovery: (request_id: number, guaranter_wallet: string, approve: boolean) =>
    req<{ status: string; request_id: number; approval_count: number; rejection_count: number }>("/auth/recovery/vote", {
      method: "POST",
      body: JSON.stringify({ request_id, guaranter_wallet, approve }),
    }),

  getRecoveryStatus: (request_id: number) =>
    req<{ id: number; status: string; approval_count: number; rejection_count: number; new_wallet: string }>(
      `/auth/recovery/status/${request_id}`
    ),
};

export const payments = {
  createOrder: (amount: number) =>
    req<{
      id: string;
      amount: number;
      currency: string;
      mode: string;
      allowed_methods: string[];
      upi_allowed: boolean;
      card_requires_valid_details: boolean;
    }>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  mockCharge: (payload: { order_id: string; amount: number; method: "card" | "upi"; card_number?: string; upi_id?: string }) =>
    req<{ status: string; verified: boolean; payment_id: string }>("/payments/mock-charge", {
      method: "POST",
      body: JSON.stringify(payload),
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

export interface PendingVoteLoan {
  id: number;
  borrower: string;
  target_amount: number;
  approvals: number;
  rejections: number;
  state: number;
  has_voted: boolean;
}

export interface LoanSnapshot {
  current_requests: LoanResponse[];
  past_requests: LoanResponse[];
  status_counts: Record<string, number>;
  events: Array<{ type: string; payload: Record<string, unknown> }>;
}

export interface RequestLoanPayload {
  borrower_address: string;
  amount: number | string;
  interest_amount: number | string;
  guardians: string[];
  funding_deadline_days?: number;
}

export interface RegisterUserPayload {
  name: string;
  phone: string;
  mpin: string;
  wallet_address: string;
  doc_hash?: string;
  dob?: string;
  aadhaar?: string;
  pan?: string;
  trust_score?: number;
}

export interface RegisterUserResponse {
  status: string;
  wallet_address: string;
  phone_last4: string;
  trust_score: number;
  chain_tx_hash?: string | null;
}

export interface TxResponse {
  tx_hash: string;
  status: string;
}

export interface RiskResponse {
  risk_label: string;
  risk_probability: number;
}

