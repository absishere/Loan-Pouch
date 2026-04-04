// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoanPouchEscrow is Ownable, ReentrancyGuard {
    IERC20 public binrToken;

    struct Loan {
        uint256 id;
        uint256 amount;
        uint256 interestAmount; // Fixed amount of interest to be paid
        address borrower;
        address lender;
        address[3] guardians;
        uint8 approvals;
        bool isFunded;
        bool isDisbursed;
        bool isRepaid;
        bool isDefaulted;
        uint256 deadline; // Timestamp when loan is due
    }

    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => mapping(address => bool)) public hasGuardianApproved;
    
    // Gamification
    mapping(address => int256) public trustScores;

    // Security (Duress/Emergency lock)
    mapping(address => bool) public isLocked;

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event GuardianApproved(uint256 indexed loanId, address indexed guardian);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
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
     * Can be called by the user or an admin relay on behalf of the user.
     */
    function setWalletLock(address user, bool status) external {
        // For hackathon: Either user self-locks, or owner (backend relay) locks it.
        require(msg.sender == user || msg.sender == owner(), "LoanPouch: Not authorized");
        isLocked[user] = status;
        emit WalletLockToggled(user, status);
    }

    /**
     * @dev Borrower creates a loan request specifying 3 guardians.
     */
    function requestLoan(
        uint256 _amount, 
        uint256 _interestAmount, 
        address[3] memory _guardians
    ) external notLocked(msg.sender) {
        require(_amount > 0, "Amount must be > 0");

        uint256 loanId = nextLoanId++;
        
        Loan storage newLoan = loans[loanId];
        newLoan.id = loanId;
        newLoan.amount = _amount;
        newLoan.interestAmount = _interestAmount;
        newLoan.borrower = msg.sender;
        newLoan.guardians = _guardians;
        // Remaining params default to false/0
        
        emit LoanRequested(loanId, msg.sender, _amount);
    }

    /**
     * @dev Lender funds a requested loan. Funds are locked in escrow.
     */
    function fundLoan(uint256 loanId) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isFunded, "Loan already funded");

        loan.lender = msg.sender;
        loan.isFunded = true;
        loan.deadline = block.timestamp + 30 days; // Example 30 day duration

        // Transfer B-INR from lender to this Escrow contract
        require(binrToken.transferFrom(msg.sender, address(this), loan.amount), "Transfer failed");

        emit LoanFunded(loanId, msg.sender);
    }

    /**
     * @dev Guardians co-sign the loan. At 2/3 approvals, funds disburse.
     */
    function approveByGuardian(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(!isLocked[loan.borrower], "LoanPouch: Borrower wallet is locked");
        require(loan.isFunded, "Loan must be funded first");
        require(!loan.isDisbursed, "Loan already disbursed");
        require(!hasGuardianApproved[loanId][msg.sender], "Already approved");

        // Verify sender is a guardian
        bool isGuardian = false;
        for (uint i = 0; i < 3; i++) {
            if (loan.guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a designated guardian");

        hasGuardianApproved[loanId][msg.sender] = true;
        loan.approvals += 1;

        emit GuardianApproved(loanId, msg.sender);

        // 2-of-3 threshold
        if (loan.approvals >= 2) {
            loan.isDisbursed = true;
            require(binrToken.transfer(loan.borrower, loan.amount), "Disbursement failed");
            emit LoanDisbursed(loanId, loan.borrower);
        }
    }

    /**
     * @dev Borrower repays Principal + Interest to Escrow, routes to Lender.
     */
    function repayLoan(uint256 loanId) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.isDisbursed, "Loan not disbursed");
        require(!loan.isRepaid, "Already repaid");
        require(!loan.isDefaulted, "Loan is in default state");

        uint256 totalRepayment = loan.amount + loan.interestAmount;

        loan.isRepaid = true;
        trustScores[loan.borrower] += 1; // Trust Score Increase

        require(binrToken.transferFrom(msg.sender, loan.lender, totalRepayment), "Repayment transfer failed");

        emit LoanRepaid(loanId, loan.borrower);
    }

    /**
     * @dev Mark a loan as defaulted if deadline passed. Decreases Trust Score.
     */
    function markDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.isDisbursed, "Loan not disbursed");
        require(!loan.isRepaid, "Already repaid");
        require(!loan.isDefaulted, "Already defaulted");
        
        // Either the lender or the backend admin can mark it defaulted
        require(msg.sender == loan.lender || msg.sender == owner(), "Not authorized");
        require(block.timestamp > loan.deadline, "Deadline not passed yet");

        loan.isDefaulted = true;
        trustScores[loan.borrower] -= 1; // Trust Score Penalty

        emit LoanDefaulted(loanId, loan.borrower);
    }

    /**
     * @dev PANIC MODE: Used if under physical duress. User enters decoy Fingerprint/PIN.
     * App calls this function, silently sending an arbitrary specified `amount` of B-INR 
     * out of their wallet into a safe decoy/vault address, returning a success response so the attacker thinks they won.
     */
    function panicTransfer(uint256 amount, address decoyVault) external nonReentrant {
        // Does not check `isLocked` because panic mode might be the only way out.
        // It bypasses normal flows natively to hide funds elsewhere.
        require(binrToken.transferFrom(msg.sender, decoyVault, amount), "Panic transfer failed");
    }
}
