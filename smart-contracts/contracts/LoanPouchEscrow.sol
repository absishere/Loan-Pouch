// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoanPouchEscrow is Ownable, ReentrancyGuard {
    IERC20 public binrToken;

    enum LoanState {
        Gathering_Funds,
        Pending_Guardians,
        Disbursed,
        Repaid,
        Cancelled,
        Defaulted
    }

    struct Loan {
        uint256 id;
        uint256 targetAmount;
        uint256 gatheredAmount;
        uint256 targetInterest; // Fixed amount of interest to be paid
        address borrower;
        address[3] guardians;
        uint8 approvals;
        uint8 rejections;
        LoanState state;
        uint256 fundingDeadline;     // When the gathering phase ends
        uint256 guardianDuration;    // Time allowed for guardians to vote once funded
        uint256 guardianDeadline;    // Timestamp when voting period expires
        uint256 repaymentDuration;   // Time borrower has to repay after disbursement
        uint256 repaymentDeadline;   // Timestamp when repayment is due
        uint256 totalRepaidAmount;   // The final lump sum deposited by borrower (Principal + Interest + Penalties)
    }

    struct Contribution {
        address lender;
        uint256 amount;
    }

    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Contribution[]) public loanContributions;
    
    // Tracks if a guardian has already voted
    mapping(uint256 => mapping(address => bool)) public hasGuardianVoted;
    
    // Gamification & Underwriting (Negative scores severely limit platform access)
    mapping(address => int256) public trustScores;

    // Security (Duress/Emergency lock)
    mapping(address => bool) public isLocked;

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount, uint256 currentTotal);
    event GuardianApproved(uint256 indexed loanId, address indexed guardian);
    event GuardianRejected(uint256 indexed loanId, address indexed guardian);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalAmount, bool latePenaltyApplied);
    event LoanCancelled(uint256 indexed loanId, string reason);
    event RefundClaimed(uint256 indexed loanId, address indexed lender, uint256 amount);
    event RepaymentClaimed(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event WalletLockToggled(address indexed user, bool isLocked);

    modifier notLocked(address user) {
        require(!isLocked[user], "LoanPouch: Wallet is locked via SMS emergency mode");
        _;
    }

    constructor(address _binrAddress) Ownable(msg.sender) {
        binrToken = IERC20(_binrAddress);
    }

    /**
     * @dev SMS Emergency Lock API for changing the lock status of a wallet.
     */
    function setWalletLock(address user, bool status) external {
        require(msg.sender == user || msg.sender == owner(), "LoanPouch: Not authorized");
        isLocked[user] = status;
        emit WalletLockToggled(user, status);
    }

    /**
     * @dev Borrower creates a loan request specifying 3 guardians and deadlines.
     */
    function requestLoan(
        uint256 _targetAmount, 
        uint256 _targetInterest, 
        address[3] memory _guardians,
        uint256 _fundingDurationSecs,
        uint256 _guardianDurationSecs,
        uint256 _repaymentDurationSecs
    ) external notLocked(msg.sender) {
        require(_targetAmount > 0, "Amount must be > 0");
        require(_fundingDurationSecs > 0, "Funding duration must be > 0");
        require(_guardianDurationSecs > 0, "Guardian duration must be > 0");
        require(_repaymentDurationSecs > 0, "Repayment duration must be > 0");

        uint256 loanId = nextLoanId++;
        
        Loan storage newLoan = loans[loanId];
        newLoan.id = loanId;
        newLoan.targetAmount = _targetAmount;
        newLoan.targetInterest = _targetInterest;
        newLoan.gatheredAmount = 0;
        newLoan.borrower = msg.sender;
        newLoan.guardians = _guardians;
        newLoan.state = LoanState.Gathering_Funds;
        newLoan.fundingDeadline = block.timestamp + _fundingDurationSecs;
        newLoan.guardianDuration = _guardianDurationSecs;
        newLoan.repaymentDuration = _repaymentDurationSecs;
        
        emit LoanRequested(loanId, msg.sender, _targetAmount);
    }

    /**
     * @dev Lenders fund the loan partially or fully.
     */
    function fundLoan(uint256 loanId, uint256 fundAmount) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(loan.state == LoanState.Gathering_Funds, "Not in gathering phase");
        require(block.timestamp <= loan.fundingDeadline, "Funding deadline passed");
        require(fundAmount > 0, "Fund amount must be > 0");
        require(loan.gatheredAmount + fundAmount <= loan.targetAmount, "Amount exceeds target");

        loan.gatheredAmount += fundAmount;
        loanContributions[loanId].push(Contribution({
            lender: msg.sender,
            amount: fundAmount
        }));

        require(binrToken.transferFrom(msg.sender, address(this), fundAmount), "Transfer failed");

        emit LoanFunded(loanId, msg.sender, fundAmount, loan.gatheredAmount);

        // Transition to guardian phase when fully funded
        if (loan.gatheredAmount == loan.targetAmount) {
            loan.state = LoanState.Pending_Guardians;
            loan.guardianDeadline = block.timestamp + loan.guardianDuration;
        }
    }

    /**
     * @dev Triggered if funding phase expired without hitting the target.
     */
    function checkFundingTimeout(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Gathering_Funds, "Not in gathering phase");
        require(block.timestamp > loan.fundingDeadline, "Deadline not passed");

        loan.state = LoanState.Cancelled;
        emit LoanCancelled(loanId, "Funding deadline passed, target missed");
    }

    /**
     * @dev Flips state to Cancelled if guardians fail to vote before deadline.
     */
    function checkGuardianTimeout(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Pending_Guardians, "Not pending guardians");
        require(block.timestamp > loan.guardianDeadline, "Deadline not passed");

        loan.state = LoanState.Cancelled;
        emit LoanCancelled(loanId, "Guardian voting deadline passed");
    }

    /**
     * @dev Guardians co-sign. At 2/3, funds disburse.
     */
    function approveByGuardian(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(!isLocked[loan.borrower], "LoanPouch: Borrower wallet is locked");
        require(loan.state == LoanState.Pending_Guardians, "Not pending guardians");
        require(block.timestamp <= loan.guardianDeadline, "Guardian voting expired");
        require(!hasGuardianVoted[loanId][msg.sender], "Already voted");

        bool isGuardian = false;
        for (uint i = 0; i < 3; i++) {
            if (loan.guardians[i] == msg.sender) {
                isGuardian = true; break;
            }
        }
        require(isGuardian, "Not a designated guardian");

        hasGuardianVoted[loanId][msg.sender] = true;
        loan.approvals += 1;

        emit GuardianApproved(loanId, msg.sender);

        if (loan.approvals >= 2) {
            loan.state = LoanState.Disbursed;
            // Begin repayment duration countdown on active disbursement
            loan.repaymentDeadline = block.timestamp + loan.repaymentDuration;
            
            require(binrToken.transfer(loan.borrower, loan.targetAmount), "Disbursement failed");
            emit LoanDisbursed(loanId, loan.borrower);
        }
    }

    /**
     * @dev Guardians can reject. At 2/3 rejections, loan cancels and triggers refunds.
     */
    function rejectByGuardian(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Pending_Guardians, "Not pending guardians");
        require(block.timestamp <= loan.guardianDeadline, "Guardian voting expired");
        require(!hasGuardianVoted[loanId][msg.sender], "Already voted");

        bool isGuardian = false;
        for (uint i = 0; i < 3; i++) {
            if (loan.guardians[i] == msg.sender) {
                isGuardian = true; break;
            }
        }
        require(isGuardian, "Not a designated guardian");

        hasGuardianVoted[loanId][msg.sender] = true;
        loan.rejections += 1;

        emit GuardianRejected(loanId, msg.sender);

        if (loan.rejections >= 2) {
            loan.state = LoanState.Cancelled;
            emit LoanCancelled(loanId, "Rejected by guardians");
        }
    }

    /**
     * @dev Pull mechanism for lenders to get their money back if Cancelled.
     */
    function claimRefund(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Cancelled, "Loan is not cancelled");

        uint256 totalRefund = 0;
        Contribution[] storage contributions = loanContributions[loanId];
        
        for (uint i = 0; i < contributions.length; i++) {
            if (contributions[i].lender == msg.sender && contributions[i].amount > 0) {
                totalRefund += contributions[i].amount;
                contributions[i].amount = 0; // Prevent re-reclaiming
            }
        }

        require(totalRefund > 0, "No funds to refund");
        
        require(binrToken.transfer(msg.sender, totalRefund), "Refund transfer failed");
        emit RefundClaimed(loanId, msg.sender, totalRefund);
    }

    /**
     * @dev Borrower pays the Lump Sum to the Escrow Ledger. State flips to Repaid.
     */
    function repayLoan(uint256 loanId) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Disbursed || loan.state == LoanState.Defaulted, "Not repayable");

        bool latePenaltyApplied = false;
        uint256 appliedInterest = loan.targetInterest;

        // Apply 2% late fee penalty on targetAmount if past deadline
        if (block.timestamp > loan.repaymentDeadline) {
            latePenaltyApplied = true;
            uint256 penalty = (loan.targetAmount * 2) / 100;
            appliedInterest += penalty;
            
            // Permanent Microfinance Blacklist metric
            trustScores[loan.borrower] -= 1; 
        } else {
            trustScores[loan.borrower] += 1; 
        }

        uint256 totalRepayment = loan.targetAmount + appliedInterest;
        
        loan.state = LoanState.Repaid; 
        loan.totalRepaidAmount = totalRepayment;

        // Pull pattern: Single large transfer IN from borrower.
        require(binrToken.transferFrom(msg.sender, address(this), totalRepayment), "Repayment failed");

        emit LoanRepaid(loanId, loan.borrower, totalRepayment, latePenaltyApplied);
    }

    /**
     * @dev Pull pattern: Individual lenders claim their proportional repayment from the pool.
     */
    function claimRepayment(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Repaid, "Loan not repaid yet");

        uint256 claimableAmount = 0;
        Contribution[] storage contributions = loanContributions[loanId];
        
        for (uint i = 0; i < contributions.length; i++) {
            if (contributions[i].lender == msg.sender && contributions[i].amount > 0) {
                // Proportional math preventing round-down errors
                uint256 lenderShare = (contributions[i].amount * loan.totalRepaidAmount) / loan.targetAmount;
                claimableAmount += lenderShare;
                contributions[i].amount = 0; // Prevent re-claiming
            }
        }

        require(claimableAmount > 0, "No funds to claim");

        require(binrToken.transfer(msg.sender, claimableAmount), "Payout transfer failed");
        emit RepaymentClaimed(loanId, msg.sender, claimableAmount);
    }

    /**
     * @dev Mark a loan as defaulted if deadline passed without repayment. Permanent flag.
     */
    function markDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Disbursed, "Not disbursed");
        require(block.timestamp > loan.repaymentDeadline, "Deadline not passed yet");
        
        bool isAuthorized = false;
        if (msg.sender == owner()) {
            isAuthorized = true;
        } else {
            Contribution[] storage contributions = loanContributions[loanId];
            for (uint i = 0; i < contributions.length; i++) {
                if (contributions[i].lender == msg.sender) {
                    isAuthorized = true; break;
                }
            }
        }
        require(isAuthorized, "Not authorized");

        loan.state = LoanState.Defaulted;
        trustScores[loan.borrower] -= 1; // Permanent flag

        emit LoanDefaulted(loanId, loan.borrower);
    }

    /**
     * @dev PANIC MODE: Duress escape hatch. 
     */
    function panicTransfer(uint256 amount, address decoyVault) external nonReentrant {
        require(binrToken.transferFrom(msg.sender, decoyVault, amount), "Panic transfer failed");
    }
}
