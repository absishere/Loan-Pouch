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
        uint256 fundedAmount;
        uint256 interestAmount; // Fixed amount of interest to be paid
        address borrower;
        address[3] guardians;
        uint8 guardianApprovals;
        bool isFunded;
        bool isDisbursed;
        bool isRepaid;
        bool isDefaulted;
        uint256 expiresAt; // Request Expiry (3 days)
        uint256 deadline; // Hard deadline for repayment (30 days post funding)
    }

    struct LenderContribution {
        address lender;
        uint256 amount;
    }

    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LenderContribution[]) public loanContributions;
    mapping(uint256 => mapping(address => bool)) public hasGuardianApprovedEscrow;
    
    // Limits
    mapping(address => uint256) public activeLoansCount;

    // Gamification
    mapping(address => int256) public trustScores;

    // Security (Duress/Emergency lock)
    mapping(address => bool) public isLocked;

    // Identity Recovery via Guardians
    mapping(address => address[3]) public userRecoveryGuardians;
    mapping(address => address) public recoveryTarget;
    mapping(address => uint256) public recoveryNonce;
    mapping(address => mapping(uint256 => mapping(address => bool))) public approvedRecovery;
    mapping(address => uint8) public recoveryApprovals;


    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event RequestRenewed(uint256 indexed loanId, uint256 newExpiry);
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
    event GuardianApprovedEscrow(uint256 indexed loanId, address indexed guardian);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    
    event WalletLockToggled(address indexed user, bool isLocked);
    event RecoveryGuardiansSet(address indexed user);
    event RecoveryInitiated(address indexed oldWallet, address newWallet);
    event IdentityRecovered(address indexed oldWallet, address newWallet);

    modifier notLocked(address user) {
        require(!isLocked[user], "LoanPouch: Wallet is locked via SMS emergency mode");
        _;
    }

    constructor(address _binrAddress) Ownable(msg.sender) {
        binrToken = IERC20(_binrAddress);
    }

    // ─── Emergency & Security ───────────────────────────────────────────────

    function setWalletLock(address user, bool status) external {
        require(msg.sender == user || msg.sender == owner(), "LoanPouch: Not authorized");
        isLocked[user] = status;
        emit WalletLockToggled(user, status);
    }

    function panicTransfer(uint256 amount, address decoyVault) external nonReentrant {
        // Bypasses `isLocked` naturally for emergency evacuation
        require(binrToken.transferFrom(msg.sender, decoyVault, amount), "Panic transfer failed");
    }

    // ─── Identity Recovery ──────────────────────────────────────────────────

    function setRecoveryGuardians(address[3] calldata _guardians) external notLocked(msg.sender) {
        userRecoveryGuardians[msg.sender] = _guardians;
        emit RecoveryGuardiansSet(msg.sender);
    }

    function _isRecoveryGuardian(address oldWallet, address caller) internal view returns (bool) {
        for (uint i = 0; i < 3; i++) {
            if (userRecoveryGuardians[oldWallet][i] == caller) return true;
        }
        return false;
    }

    function initiateRecovery(address oldWallet, address newWallet) external {
        require(_isRecoveryGuardian(oldWallet, msg.sender), "Not a recovery guardian");
        
        recoveryNonce[oldWallet]++;
        recoveryTarget[oldWallet] = newWallet;
        recoveryApprovals[oldWallet] = 1;
        
        approvedRecovery[oldWallet][recoveryNonce[oldWallet]][msg.sender] = true;
        emit RecoveryInitiated(oldWallet, newWallet);
    }

    function approveRecovery(address oldWallet, address newWallet) external {
        require(_isRecoveryGuardian(oldWallet, msg.sender), "Not a recovery guardian");
        require(recoveryTarget[oldWallet] == newWallet, "Target mismatch");
        require(!approvedRecovery[oldWallet][recoveryNonce[oldWallet]][msg.sender], "Already approved");
        
        approvedRecovery[oldWallet][recoveryNonce[oldWallet]][msg.sender] = true;
        recoveryApprovals[oldWallet]++;

        if (recoveryApprovals[oldWallet] >= 2) {
            // Migrate Identity
            trustScores[newWallet] = trustScores[oldWallet];
            trustScores[oldWallet] = 0;
            
            isLocked[newWallet] = isLocked[oldWallet];
            
            activeLoansCount[newWallet] = activeLoansCount[oldWallet];
            activeLoansCount[oldWallet] = 999; // Permanently block the old compromised wallet

            recoveryNonce[oldWallet]++; // Prevent replay
            emit IdentityRecovered(oldWallet, newWallet);
        }
    }


    // ─── Loan Core (Request, Renew, Fund, Disburse, Repay) ───────────────────

    function requestLoan(
        uint256 _amount, 
        uint256 _interestAmount, 
        address[3] memory _guardians
    ) external notLocked(msg.sender) {
        require(_amount > 0, "Amount must be > 0");
        require(activeLoansCount[msg.sender] < 2, "Max 2 active loans allowed");

        activeLoansCount[msg.sender] += 1;

        uint256 loanId = nextLoanId++;
        Loan storage newLoan = loans[loanId];
        newLoan.id = loanId;
        newLoan.amount = _amount;
        newLoan.fundedAmount = 0;
        newLoan.interestAmount = _interestAmount;
        newLoan.borrower = msg.sender;
        newLoan.guardians = _guardians;
        newLoan.expiresAt = block.timestamp + 3 days;
        
        emit LoanRequested(loanId, msg.sender, _amount);
    }

    function renewRequest(uint256 loanId) external notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Only borrower can renew");
        require(!loan.isFunded, "Already funded");
        
        loan.expiresAt = block.timestamp + 3 days;
        emit RequestRenewed(loanId, loan.expiresAt);
    }

    function fundLoan(uint256 loanId, uint256 amount) external notLocked(msg.sender) nonReentrant {
        require(amount > 0, "Amount > 0");
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isFunded, "Loan already fully funded");
        require(block.timestamp <= loan.expiresAt, "Loan request has expired");

        uint256 remaining = loan.amount - loan.fundedAmount;
        uint256 contribution = amount > remaining ? remaining : amount;

        loan.fundedAmount += contribution;
        loanContributions[loanId].push(LenderContribution(msg.sender, contribution));

        // Transfer B-INR to Escrow
        require(binrToken.transferFrom(msg.sender, address(this), contribution), "Transfer failed");

        if (loan.fundedAmount == loan.amount) {
            loan.isFunded = true;
            loan.deadline = block.timestamp + 30 days; // Starts when fully funded
        }

        emit LoanFunded(loanId, msg.sender, contribution);
    }

    function approveByGuardian(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(!isLocked[loan.borrower], "LoanPouch: Borrower wallet is locked");
        require(loan.isFunded, "Loan must be funded first");
        require(!loan.isDisbursed, "Loan already disbursed");
        require(!hasGuardianApprovedEscrow[loanId][msg.sender], "Already approved");

        bool isGuardian = false;
        for (uint i = 0; i < 3; i++) {
            if (loan.guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a designated escrow guardian");

        hasGuardianApprovedEscrow[loanId][msg.sender] = true;
        loan.guardianApprovals += 1;

        emit GuardianApprovedEscrow(loanId, msg.sender);

        // 2-of-3 threshold
        if (loan.guardianApprovals >= 2) {
            loan.isDisbursed = true;
            require(binrToken.transfer(loan.borrower, loan.amount), "Disbursement failed");
            emit LoanDisbursed(loanId, loan.borrower);
        }
    }

    function repayLoan(uint256 loanId) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.isDisbursed, "Loan not disbursed");
        require(!loan.isRepaid, "Already repaid");
        require(!loan.isDefaulted, "Loan is in default state");

        loan.isRepaid = true;
        
        // Gamification + Unlocking Loan Limit
        trustScores[loan.borrower] += 1; 
        if (activeLoansCount[loan.borrower] > 0) {
            activeLoansCount[loan.borrower] -= 1;
        }

        uint256 totalRepayment = loan.amount + loan.interestAmount;
        require(binrToken.transferFrom(msg.sender, address(this), totalRepayment), "Repayment transfer failed");

        // Group Lending Pro-Rata Distribution
        LenderContribution[] memory contributors = loanContributions[loanId];
        for (uint i = 0; i < contributors.length; i++) {
            uint256 share = (totalRepayment * contributors[i].amount) / loan.amount;
            require(binrToken.transfer(contributors[i].lender, share), "Distribution failed");
        }

        emit LoanRepaid(loanId, loan.borrower);
    }

    function markDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.isDisbursed, "Loan not disbursed");
        require(!loan.isRepaid, "Already repaid");
        require(!loan.isDefaulted, "Already defaulted");
        
        bool isContributor = false;
        if (msg.sender != owner()) {
            LenderContribution[] memory contributors = loanContributions[loanId];
            for (uint i = 0; i < contributors.length; i++) {
                if (contributors[i].lender == msg.sender) isContributor = true;
            }
        }
        
        require(isContributor || msg.sender == owner(), "Not authorized");
        require(block.timestamp > loan.deadline, "Deadline not passed");

        loan.isDefaulted = true;
        trustScores[loan.borrower] -= 1; 
        // We do NOT decrement activeLoansCount here. A defaulted loan permanently blocks that slot.

        emit LoanDefaulted(loanId, loan.borrower);
    }
}
