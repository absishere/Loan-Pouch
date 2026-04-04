// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract B_INR is ERC20, Ownable {
    constructor() ERC20("LoanPouch INR", "BINR") Ownable(msg.sender) {
        // Mint initial supply of 100,000 BINR to deployer for liquidity provision testing
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    /**
     * @dev Public minting function strictly for Testnet Hackathon purposes.
     * This allows any user to mint testnet tokens to interact with the Escrow.
     * In Production, this would be restricted or removed since B-INR is a stablecoin.
     */
    function faucetMint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
