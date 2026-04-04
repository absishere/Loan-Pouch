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
        uint256 targetInterest; 
        address borrower;
        address[3] guardians;
        uint8 approvals;
        uint8 rejections;
        LoanState state;
        
        uint256 fundingDeadline;
        uint256 guardianDeadline;
        uint256 repaymentDeadline;
        uint256 totalRepaidAmount;

        // Tranche Logic (Milestone Disbursements)
        bool isMilestone;
        uint8 claimedTranches;
        uint8 repaidTranches;
    }

    struct Contribution {
        address lender;
        uint256 amount;
    }

    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Contribution[]) public loanContributions;
    
    mapping(uint256 => mapping(address => bool)) public hasGuardianVoted;
    
    // Limits
    mapping(address => uint256) public activeLoansCount;

    // Zero-Knowledge Identity Check
    mapping(address => bool) public isZkVerified;

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
    event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount, uint256 currentTotal);
    event GuardianApproved(uint256 indexed loanId, address indexed guardian, uint8 weightApplied);
    event GuardianRejected(uint256 indexed loanId, address indexed guardian);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower);
    event TrancheClaimed(uint256 indexed loanId, uint8 trancheNumber);
    event InstallmentRepaid(uint256 indexed loanId, uint8 trancheNumber);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalAmount, bool late);
    event LoanCancelled(uint256 indexed loanId, string reason);
    event RefundClaimed(uint256 indexed loanId, address indexed lender, uint256 amount);
    event RepaymentClaimed(uint256 indexed loanId, address indexed lender, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    
    event WalletLockToggled(address indexed user, bool isLocked);
    event IdentityRecovered(address indexed oldWallet, address newWallet);

    modifier notLocked(address user) {
        require(!isLocked[user], "LoanPouch: Wallet is locked via SMS emergency mode");
        _;
    }

    constructor(address _binrAddress) Ownable(msg.sender) {
        binrToken = IERC20(_binrAddress);
    }

    // ─── Security & Recovery ───────────────────────────────────────────────

    function setWalletLock(address user, bool status) external {
        require(msg.sender == user || msg.sender == owner(), "Not authorized");
        isLocked[user] = status;
        emit WalletLockToggled(user, status);
    }

    function panicTransfer(uint256 amount, address decoyVault) external nonReentrant {
        require(binrToken.transferFrom(msg.sender, decoyVault, amount), "Panic transfer failed");
    }

    function setRecoveryGuardians(address[3] calldata _guardians) external notLocked(msg.sender) {
        userRecoveryGuardians[msg.sender] = _guardians;
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
    }

    function approveRecovery(address oldWallet, address newWallet) external {
        require(_isRecoveryGuardian(oldWallet, msg.sender), "Not a guardian");
        require(recoveryTarget[oldWallet] == newWallet, "Target mismatch");
        require(!approvedRecovery[oldWallet][recoveryNonce[oldWallet]][msg.sender], "Already approved");
        
        approvedRecovery[oldWallet][recoveryNonce[oldWallet]][msg.sender] = true;
        recoveryApprovals[oldWallet]++;

        if (recoveryApprovals[oldWallet] >= 2) {
            trustScores[newWallet] = trustScores[oldWallet];
            trustScores[oldWallet] = 0;
            isLocked[newWallet] = isLocked[oldWallet];
            activeLoansCount[newWallet] = activeLoansCount[oldWallet];
            activeLoansCount[oldWallet] = 999; 
            isZkVerified[newWallet] = isZkVerified[oldWallet];
            recoveryNonce[oldWallet]++;
            emit IdentityRecovered(oldWallet, newWallet);
        }
    }

    function verifyIdentityProof(address user, bytes calldata /* proof */) external {
        require(msg.sender == owner(), "Only trusted Oracle for Hackathon");
        isZkVerified[user] = true;
    }

    // ─── Loan Core ──────────────────────────────────────────────────────────

    function requestLoan(
        uint256 _targetAmount, 
        uint256 _targetInterest, 
        address[3] memory _guardians,
        uint256 _fundingDurationSecs,
        uint256 _repaymentDurationSecs
    ) external notLocked(msg.sender) {
        require(_targetAmount > 0, "Amount must be > 0");
        require(activeLoansCount[msg.sender] < 2, "Max active loans reached");

        if (_targetAmount >= 1000000 * 10**18) {
            require(isZkVerified[msg.sender], "ZK Identity Proof required for loans >= 1M");
        }

        activeLoansCount[msg.sender] += 1;
        uint256 loanId = nextLoanId++;
        
        Loan storage newLoan = loans[loanId];
        newLoan.id = loanId;
        newLoan.targetAmount = _targetAmount;
        newLoan.targetInterest = _targetInterest;
        newLoan.borrower = msg.sender;
        newLoan.guardians = _guardians;
        newLoan.state = LoanState.Gathering_Funds;
        newLoan.fundingDeadline = block.timestamp + _fundingDurationSecs;
        newLoan.repaymentDeadline = _repaymentDurationSecs; // acts as duration until Disbursed
        
        emit LoanRequested(loanId, msg.sender, _targetAmount);
    }

    function fundLoan(uint256 loanId, uint256 fundAmount) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Gathering_Funds, "Not in gathering phase");
        require(block.timestamp <= loan.fundingDeadline, "Funding expired");
        require(loan.gatheredAmount + fundAmount <= loan.targetAmount, "Exceeds target");

        loan.gatheredAmount += fundAmount;
        loanContributions[loanId].push(Contribution(msg.sender, fundAmount));
        require(binrToken.transferFrom(msg.sender, address(this), fundAmount), "Transfer failed");

        emit LoanFunded(loanId, msg.sender, fundAmount, loan.gatheredAmount);

        if (loan.gatheredAmount == loan.targetAmount) {
            loan.state = LoanState.Pending_Guardians;
            loan.guardianDeadline = block.timestamp + 3 days;
        }
    }

    // ─── Algorithmic Trust Guardians ────────────────────────────────────────

    function _isLoanGuardian(uint256 loanId, address caller) internal view returns (bool) {
        for (uint i = 0; i < 3; i++) {
            if (loans[loanId].guardians[i] == caller) return true;
        }
        return false;
    }

    function approveByGuardian(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(!isLocked[loan.borrower], "Borrower wallet locked");
        require(loan.state == LoanState.Pending_Guardians, "Not pending guardians");
        require(block.timestamp <= loan.guardianDeadline, "Voting expired");
        require(!hasGuardianVoted[loanId][msg.sender], "Already voted");
        require(_isLoanGuardian(loanId, msg.sender), "Not a designated guardian");

        hasGuardianVoted[loanId][msg.sender] = true;
        
        // Algorithmic Weighting: Elders carry 2x weight
        uint8 weight = trustScores[msg.sender] >= 50 ? 2 : 1;
        loan.approvals += weight;

        emit GuardianApproved(loanId, msg.sender, weight);

        if (loan.approvals >= 2) {
            loan.state = LoanState.Disbursed;
            // The stored duration is converted into fixed deadline
            loan.repaymentDeadline = block.timestamp + loan.repaymentDeadline; 
            
            if (loan.targetAmount >= 1000000 * 10**18) {
                loan.isMilestone = true;
            } else {
                require(binrToken.transfer(loan.borrower, loan.targetAmount), "Failed");
            }
            emit LoanDisbursed(loanId, loan.borrower);
        }
    }

    function rejectByGuardian(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Pending_Guardians);
        require(!hasGuardianVoted[loanId][msg.sender]);
        require(_isLoanGuardian(loanId, msg.sender));

        hasGuardianVoted[loanId][msg.sender] = true;
        uint8 weight = trustScores[msg.sender] >= 50 ? 2 : 1;
        loan.rejections += weight;

        if (loan.rejections >= 2) {
            loan.state = LoanState.Cancelled;
            if (activeLoansCount[loan.borrower] > 0) activeLoansCount[loan.borrower] -= 1;
            emit LoanCancelled(loanId, "Rejected by guardians");
        }
    }

    // ─── Milestone Disbursements ────────────────────────────────────────────

    function claimDisbursementTranche(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Disbursed, "Not active/disbursed");
        require(loan.borrower == msg.sender, "Not borrower");
        require(loan.isMilestone, "Not a milestone loan");
        require(loan.claimedTranches < 4, "All tranches claimed");
        require(loan.claimedTranches <= loan.repaidTranches, "Repay previous tranche first to unlock next");

        loan.claimedTranches += 1;
        uint256 payout = loan.targetAmount / 4;
        require(binrToken.transfer(loan.borrower, payout), "Transfer failed");

        emit TrancheClaimed(loanId, loan.claimedTranches);
    }

    // ─── Repayments & End of Lifecycle ──────────────────────────────────────

    function repayLoan(uint256 loanId) external notLocked(msg.sender) nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Disbursed, "Not repayable");

        bool late = block.timestamp > loan.repaymentDeadline;
        uint256 appliedInterest = loan.targetInterest;
        if (late) appliedInterest += (loan.targetAmount * 2) / 100;

        if (loan.isMilestone) {
            require(loan.repaidTranches < 4, "Fully repaid already");
            require(loan.repaidTranches < loan.claimedTranches, "Claim next tranche first");
            
            loan.repaidTranches += 1;
            uint256 installment = (loan.targetAmount + appliedInterest) / 4;
            loan.totalRepaidAmount += installment;
            require(binrToken.transferFrom(msg.sender, address(this), installment), "Transfer failed");

            emit InstallmentRepaid(loanId, loan.repaidTranches);

            if (loan.repaidTranches == 4) {
                _finalizeRepayment(loan, late);
            }
        } else {
            uint256 totalRepayment = loan.targetAmount + appliedInterest;
            loan.totalRepaidAmount = totalRepayment;
            require(binrToken.transferFrom(msg.sender, address(this), totalRepayment), "Transfer failed");
            _finalizeRepayment(loan, late);
        }
    }

    function _finalizeRepayment(Loan storage loan, bool late) internal {
        loan.state = LoanState.Repaid;
        if (!late) trustScores[loan.borrower] += 1;
        else trustScores[loan.borrower] -= 1;

        if (activeLoansCount[loan.borrower] > 0) activeLoansCount[loan.borrower] -= 1;
        emit LoanRepaid(loan.id, loan.borrower, loan.totalRepaidAmount, late);
    }

    // ─── PULL PATTERNS (Refunds / Lender Payouts) ──────────────────────────

    function claimRefund(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Cancelled, "Not cancelled");
        uint256 totalRefund = 0;
        for (uint i = 0; i < loanContributions[loanId].length; i++) {
            if (loanContributions[loanId][i].lender == msg.sender && loanContributions[loanId][i].amount > 0) {
                totalRefund += loanContributions[loanId][i].amount;
                loanContributions[loanId][i].amount = 0; 
            }
        }
        require(totalRefund > 0, "No funds");
        require(binrToken.transfer(msg.sender, totalRefund));
        emit RefundClaimed(loanId, msg.sender, totalRefund);
    }

    function claimRepayment(uint256 loanId) external nonReentrant notLocked(msg.sender) {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Repaid, "Not repaid");
        uint256 claimAmount = 0;
        for (uint i = 0; i < loanContributions[loanId].length; i++) {
            if (loanContributions[loanId][i].lender == msg.sender && loanContributions[loanId][i].amount > 0) {
                claimAmount += (loanContributions[loanId][i].amount * loan.totalRepaidAmount) / loan.targetAmount;
                loanContributions[loanId][i].amount = 0;
            }
        }
        require(claimAmount > 0, "No funds");
        require(binrToken.transfer(msg.sender, claimAmount));
        emit RepaymentClaimed(loanId, msg.sender, claimAmount);
    }

    function checkFundingTimeout(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Gathering_Funds);
        require(block.timestamp > loan.fundingDeadline);
        loan.state = LoanState.Cancelled;
        if (activeLoansCount[loan.borrower] > 0) activeLoansCount[loan.borrower] -= 1;
        emit LoanCancelled(loanId, "Target missed");
    }

    function markDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Disbursed);
        require(block.timestamp > loan.repaymentDeadline);
        
        bool auth = msg.sender == owner();
        for (uint i=0; !auth && i<loanContributions[loanId].length; i++) {
            if (loanContributions[loanId][i].lender == msg.sender) auth = true;
        }
        require(auth, "Not authorized");

        loan.state = LoanState.Defaulted;
        trustScores[loan.borrower] -= 1;
        // activeLoansCount is permanently locked
        emit LoanDefaulted(loanId, loan.borrower);
    }
}
