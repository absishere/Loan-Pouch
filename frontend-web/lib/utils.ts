import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LOAN_STATE_LABELS: Record<number, string> = {
  0: "Gathering",
  1: "Pending",
  2: "Disbursed",
  3: "Repaid",
  4: "Cancelled",
  5: "Defaulted",
};

// Trust Score utilities
export function getTrustScoreTier(score: number): {
  tier: string;
  baseRate: number;
  color: string;
} {
  if (score >= 651) return { tier: "Elite", baseRate: 4, color: "text-green-600" };
  if (score >= 501) return { tier: "Reliable", baseRate: 5, color: "text-blue-600" };
  if (score >= 301) return { tier: "Trusted", baseRate: 6, color: "text-purple-600" };
  return { tier: "New Member", baseRate: 8, color: "text-gray-600" };
}

export function calculateInterestRate(trustScore: number): number {
  const { baseRate } = getTrustScoreTier(trustScore);
  const pointsAboveBase = Math.max(0, trustScore - 300);
  const reduction = pointsAboveBase * 0.002; // 0.2% per point
  return Math.max(4, baseRate - reduction); // Floor at 4%
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

// Generate avatar initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Calculate days until due
export function getDaysUntilDue(dueDate: Date | string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'funded':
    case 'completed':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'pending':
    case 'processing':
    case 'open':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'overdue':
    case 'defaulted':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}
