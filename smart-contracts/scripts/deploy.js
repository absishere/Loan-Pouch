import hardhat from "hardhat";

async function main() {
  console.log("Starting deployment to Sepolia...");

  // 1. Deploy the B-INR Token Custom Contract
  const binrToken = await hardhat.ethers.deployContract("B_INR");
  await binrToken.waitForDeployment();
  const binrAddress = await binrToken.getAddress();
  console.log(`✅ B_INR Token deployed to: ${binrAddress}`);

  // 2. Deploy the LoanPouch Escrow Contract, passing the token address
  const loanPouchEscrow = await hardhat.ethers.deployContract("LoanPouchEscrow", [binrAddress]);
  await loanPouchEscrow.waitForDeployment();
  const escrowAddress = await loanPouchEscrow.getAddress();
  console.log(`✅ LoanPouch Escrow deployed to: ${escrowAddress}`);

  console.log("\n--- Deployment Completed ---");
  console.log(`Next Step: Save these addresses in your frontend/backend .env file!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
