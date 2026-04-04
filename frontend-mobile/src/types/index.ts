// TypeScript types for LoanPouch Mobile
export interface User {
  id: string;
  name: string;
  email: string;
  trustScore: number;
  balance: number;
  walletAddress: string;
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  duration: number;
  purpose: string;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  borrower: string;
  lender?: string;
  dueDate: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'borrow' | 'lend' | 'repayment';
  amount: number;
  counterparty: string;
  date: Date;
  loanId?: string;
}