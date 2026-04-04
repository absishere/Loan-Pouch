// Mock user data
export const mockUser = {
  id: "user_001",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  phone: "+91 98765 43210",
  trustScore: 485,
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  balance: 12450.75,
  joined: "2024-01-15",
  kycVerified: true,
  guardians: [
    { id: "g1", name: "Priya Patel", phone: "+91 98123 45678" },
    { id: "g2", name: "Amit Kumar", phone: "+91 99887 76655" },
    { id: "g3", name: "Sneha Reddy", phone: "+91 97765 43221" },
  ],
};

// Mock loan requests
export const mockLoanRequests = [
  {
    id: "loan_001",
    borrower: {
      name: "Priya Patel",
      trustScore: 520,
      avatar: "PP",
    },
    amount: 15000,
    duration: 30,
    purpose: "Education",
    interestRate: 5.2,
    fundedAmount: 8000,
    totalFunded: 15000,
    createdAt: "2024-03-28",
    expiresAt: "2024-03-31",
    status: "open",
  },
  {
    id: "loan_002",
    borrower: {
      name: "Amit Kumar",
      trustScore: 650,
      avatar: "AK",
    },
    amount: 25000,
    duration: 15,
    purpose: "Medical",
    interestRate: 4.5,
    fundedAmount: 25000,
    totalFunded: 25000,
    createdAt: "2024-03-27",
    expiresAt: "2024-03-30",
    status: "funded",
  },
  {
    id: "loan_003",
    borrower: {
      name: "Sneha Reddy",
      trustScore: 380,
      avatar: "SR",
    },
    amount: 10000,
    duration: 7,
    purpose: "Emergency",
    interestRate: 6.8,
    fundedAmount: 3500,
    totalFunded: 10000,
    createdAt: "2024-03-29",
    expiresAt: "2024-04-01",
    status: "open",
  },
  {
    id: "loan_004",
    borrower: {
      name: "Vikram Singh",
      trustScore: 720,
      avatar: "VS",
    },
    amount: 20000,
    duration: 30,
    purpose: "Personal",
    interestRate: 4.0,
    fundedAmount: 12000,
    totalFunded: 20000,
    createdAt: "2024-03-26",
    expiresAt: "2024-03-29",
    status: "open",
  },
];

// Mock active loans
export const mockActiveLoans = [
  {
    id: "active_001",
    type: "borrowed",
    amount: 10000,
    interestRate: 5.5,
    duration: 30,
    dueDate: "2024-04-15",
    repaidAmount: 5000,
    status: "active",
    lender: "Multiple Lenders",
  },
  {
    id: "active_002",
    type: "lent",
    amount: 15000,
    interestRate: 4.8,
    duration: 15,
    dueDate: "2024-04-08",
    repaidAmount: 0,
    status: "active",
    borrower: "Priya Patel",
  },
];

// Mock transaction history
export const mockTransactions = [
  {
    id: "txn_001",
    type: "lent",
    amount: 15000,
    counterparty: "Priya Patel",
    date: "2024-03-28",
    status: "completed",
    txHash: "0x8f3d...9a2c",
  },
  {
    id: "txn_002",
    type: "borrowed",
    amount: 10000,
    counterparty: "Multiple Lenders",
    date: "2024-03-15",
    status: "completed",
    txHash: "0x1a4b...7e3f",
  },
  {
    id: "txn_003",
    type: "repayment",
    amount: 5250,
    counterparty: "Amit Kumar",
    date: "2024-03-10",
    status: "completed",
    txHash: "0x9c2e...4d8a",
  },
  {
    id: "txn_004",
    type: "received",
    amount: 16200,
    counterparty: "Sneha Reddy",
    date: "2024-03-05",
    status: "completed",
    txHash: "0x6f1a...2b9c",
  },
];

// Mock Trust Score breakdown
export const mockTrustScoreBreakdown = [
  { factor: "Repayment Punctuality", weight: 35, score: 32 },
  { factor: "Transaction Consistency", weight: 25, score: 22 },
  { factor: "Network Trust", weight: 20, score: 16 },
  { factor: "Loan-to-Repay Ratio", weight: 20, score: 18 },
];

// Category colors
export const categoryColors: Record<string, string> = {
  Education: "bg-blue-100 text-blue-700 border-blue-200",
  Medical: "bg-red-100 text-red-700 border-red-200",
  Emergency: "bg-orange-100 text-orange-700 border-orange-200",
  Personal: "bg-purple-100 text-purple-700 border-purple-200",
};

// Trust score history (for chart)
export const mockTrustScoreHistory = [
  { month: "Oct", score: 420 },
  { month: "Nov", score: 445 },
  { month: "Dec", score: 460 },
  { month: "Jan", score: 470 },
  { month: "Feb", score: 475 },
  { month: "Mar", score: 485 },
];
