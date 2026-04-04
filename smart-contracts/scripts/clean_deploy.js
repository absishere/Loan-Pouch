import hardhat from "hardhat";

async function main() {
  console.log("Starting deployment to Sepolia...");

  // 1. Deploy the B-INR Token
  console.log("Deploying B_INR...");
  const binrToken = await hardhat.ethers.deployContract("B_INR");
  await binrToken.waitForDeployment();
  const binrAddress = await binrToken.getAddress();
  console.log(`CLEAN_BINR_ADDRESS=${binrAddress}`);

  // 2. Deploy the Escrow Contract
  console.log("Deploying Escrow...");
  // Pass the binrAddress as constructor arg
  const loanPouchEscrow = await hardhat.ethers.deployContract("LoanPouchEscrow", [binrAddress]);
  await loanPouchEscrow.waitForDeployment();
  const escrowAddress = await loanPouchEscrow.getAddress();
  console.log(`CLEAN_ESCROW_ADDRESS=${escrowAddress}`);

  console.log("Deployment Completed Successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
