export interface LoanPouchUser {
  name: string;
  phoneLast4: string;
  trustScore: number;
  walletAddress: string;
  joined: string;
}

const CURRENT_USER_KEY = "lp_user_profile";
const REGISTERED_FLAG_KEY = "lp_wallet_registered";
const DEMO_BALANCE_PREFIX = "lp_demo_binr_balance_";

export function setCurrentUser(user: LoanPouchUser) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  localStorage.setItem(REGISTERED_FLAG_KEY, "true");
}

export function getCurrentUser(): LoanPouchUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoanPouchUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(REGISTERED_FLAG_KEY);
}

export function getDemoBalance(walletAddress: string): number {
  if (typeof window === "undefined" || !walletAddress) return 0;
  const raw = localStorage.getItem(`${DEMO_BALANCE_PREFIX}${walletAddress.toLowerCase()}`);
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function addDemoBalance(walletAddress: string, amount: number): number {
  if (typeof window === "undefined" || !walletAddress) return 0;
  const current = getDemoBalance(walletAddress);
  const next = Math.max(0, current + amount);
  localStorage.setItem(`${DEMO_BALANCE_PREFIX}${walletAddress.toLowerCase()}`, String(next));
  return next;
}

