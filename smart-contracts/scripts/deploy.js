import hardhat from "hardhat";

async function main() {
  console.log("Starting deployment to Sepolia...");

  const binrToken = await hardhat.ethers.deployContract("B_INR");
  await binrToken.waitForDeployment();
  const binrAddress = await binrToken.getAddress();
  console.log(`B_INR Token deployed to: ${binrAddress}`);

  const loanPouchEscrow = await hardhat.ethers.deployContract("LoanPouchEscrow", [binrAddress]);
  await loanPouchEscrow.waitForDeployment();
  const escrowAddress = await loanPouchEscrow.getAddress();
  console.log(`Loan Pouch Escrow deployed to: ${escrowAddress}`);

  const identityRegistry = await hardhat.ethers.deployContract("IdentityRegistry");
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log(`IdentityRegistry deployed to: ${identityRegistryAddress}`);

  console.log("\n--- Deployment Completed ---");
  console.log("Set these in .env:");
  console.log(`BINR_CONTRACT_ADDRESS=${binrAddress}`);
  console.log(`ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`IDENTITY_REGISTRY_CONTRACT_ADDRESS=${identityRegistryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

