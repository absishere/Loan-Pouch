// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityRegistry is Ownable {
    struct IdentityRecord {
        address wallet;
        bytes32 phoneHash;
        bytes32 docHash;
        bytes32 commitment;
        uint256 registeredAt;
    }

    mapping(bytes32 => address) public phoneHashToWallet;
    mapping(bytes32 => address) public docHashToWallet;
    mapping(address => IdentityRecord) public walletToIdentity;

    event IdentityRegistered(
        address indexed wallet,
        bytes32 indexed phoneHash,
        bytes32 indexed docHash,
        bytes32 commitment
    );

    constructor() Ownable(msg.sender) {}

    function registerIdentity(
        address wallet,
        bytes32 phoneHash,
        bytes32 docHash,
        bytes32 commitment
    ) external onlyOwner {
        require(wallet != address(0), "wallet required");
        require(phoneHash != bytes32(0), "phone hash required");
        require(docHash != bytes32(0), "doc hash required");

        address existingPhoneWallet = phoneHashToWallet[phoneHash];
        require(existingPhoneWallet == address(0) || existingPhoneWallet == wallet, "phone already registered");

        address existingDocWallet = docHashToWallet[docHash];
        require(existingDocWallet == address(0) || existingDocWallet == wallet, "document already registered");

        IdentityRecord storage prior = walletToIdentity[wallet];
        if (prior.wallet == address(0)) {
            walletToIdentity[wallet] = IdentityRecord({
                wallet: wallet,
                phoneHash: phoneHash,
                docHash: docHash,
                commitment: commitment,
                registeredAt: block.timestamp
            });
        } else {
            walletToIdentity[wallet].phoneHash = phoneHash;
            walletToIdentity[wallet].docHash = docHash;
            walletToIdentity[wallet].commitment = commitment;
        }

        phoneHashToWallet[phoneHash] = wallet;
        docHashToWallet[docHash] = wallet;

        emit IdentityRegistered(wallet, phoneHash, docHash, commitment);
    }
}

