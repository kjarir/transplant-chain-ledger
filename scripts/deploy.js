const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of TransplantChainLedger contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const TransplantChainLedger = await ethers.getContractFactory("TransplantChainLedger");
  console.log("⏳ Deploying TransplantChainLedger...");
  
  const transplantLedger = await TransplantChainLedger.deploy();
  await transplantLedger.deployed();

  console.log("✅ TransplantChainLedger deployed to:", transplantLedger.address);

  // Save deployment info
  const deploymentInfo = {
    network: await deployer.provider.getNetwork(),
    contractAddress: transplantLedger.address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: transplantLedger.deployTransaction.hash,
    blockNumber: transplantLedger.deployTransaction.blockNumber,
    gasUsed: transplantLedger.deployTransaction.gasLimit.toString(),
    contractName: "TransplantChainLedger",
    compilerVersion: "0.8.19",
    constructorArgs: []
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${await deployer.provider.getNetwork().then(n => n.name)}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Verify contract on Etherscan (if on a supported network)
  if (await deployer.provider.getNetwork().then(n => n.chainId !== 31337)) {
    console.log("⏳ Waiting for block confirmations before verification...");
    await transplantLedger.deployTransaction.wait(6);
    
    try {
      console.log("🔍 Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: transplantLedger.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully on Etherscan!");
    } catch (error) {
      console.log("❌ Contract verification failed:", error.message);
    }
  }

  // Generate contract ABI and save to frontend
  const contractArtifact = await ethers.getContractFactory("TransplantChainLedger");
  const abi = contractArtifact.interface.format(ethers.utils.FormatTypes.json);
  
  const abiInfo = {
    contractAddress: transplantLedger.address,
    abi: JSON.parse(abi),
    network: await deployer.provider.getNetwork().then(n => n.name),
    chainId: (await deployer.provider.getNetwork()).chainId
  };

  // Save ABI for frontend integration
  const frontendDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendDir, "TransplantChainLedger.json"),
    JSON.stringify(abiInfo, null, 2)
  );
  
  console.log("📄 Contract ABI saved to frontend directory");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log(`   Address: ${transplantLedger.address}`);
  console.log(`   Network: ${deploymentInfo.network.name}`);
  console.log(`   Chain ID: ${deploymentInfo.network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Transaction: ${deploymentInfo.transactionHash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
