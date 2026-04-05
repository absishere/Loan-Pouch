import hardhat from "hardhat";

async function main() {
  console.log("Deploying IdentityRegistry to Sepolia...");
  const identityRegistry = await hardhat.ethers.deployContract("IdentityRegistry");
  await identityRegistry.waitForDeployment();
  const address = await identityRegistry.getAddress();
  console.log(`IDENTITY_REGISTRY_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

