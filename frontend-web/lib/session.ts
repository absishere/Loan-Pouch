export interface LoanPouchUser {
  name: string;
  phoneLast4: string;
  trustScore: number;
  walletAddress: string;
  joined: string;
}

const CURRENT_USER_KEY = "lp_user_profile";
const REGISTERED_FLAG_KEY = "lp_wallet_registered";

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

