const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of TransplantChainLedger contract to MegaETH...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Get network info
  const network = await deployer.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());

  // Deploy the contract
  const TransplantChainLedger = await ethers.getContractFactory("TransplantChainLedger");
  console.log("⏳ Deploying TransplantChainLedger to MegaETH...");
  
  // MegaETH supports larger contracts (512KB vs 24KB on Ethereum)
  console.log("📏 Contract size limit: 512KB (MegaETH advantage)");
  
  const transplantLedger = await TransplantChainLedger.deploy();
  await transplantLedger.deployed();

  console.log("✅ TransplantChainLedger deployed to MegaETH!");
  console.log("📍 Contract Address:", transplantLedger.address);
  console.log("🔗 Transaction Hash:", transplantLedger.deployTransaction.hash);
  console.log("⛽ Gas Used:", transplantLedger.deployTransaction.gasLimit.toString());

  // Save deployment info
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: network.chainId.toString()
    },
    contractAddress: transplantLedger.address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: transplantLedger.deployTransaction.hash,
    blockNumber: transplantLedger.deployTransaction.blockNumber,
    gasUsed: transplantLedger.deployTransaction.gasLimit.toString(),
    contractName: "TransplantChainLedger",
    compilerVersion: "0.8.19",
    constructorArgs: [],
    networkType: "MegaETH Testnet",
    features: [
      "512KB contract size limit",
      "Prague EVM compatibility", 
      "High performance execution",
      "EVM compatible"
    ]
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `megaeth-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  await transplantLedger.deployTransaction.wait(3);

  // Try to verify contract (if MegaETH has verification support)
  try {
    console.log("🔍 Attempting contract verification...");
    await hre.run("verify:verify", {
      address: transplantLedger.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("⚠️  Contract verification failed (may not be supported yet on MegaETH):", error.message);
    console.log("📝 Manual verification may be required when MegaETH block explorer is available");
  }

  // Generate contract ABI and save to frontend
  const contractArtifact = await ethers.getContractFactory("TransplantChainLedger");
  const abi = contractArtifact.interface.format(ethers.utils.FormatTypes.json);
  
  const abiInfo = {
    contractAddress: transplantLedger.address,
    abi: JSON.parse(abi),
    network: "megaeth",
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    networkInfo: {
      name: "MegaETH Testnet",
      rpcUrl: "https://carrot.megaeth.com/rpc",
      chainId: 6342,
      blockExplorer: "Not available yet"
    }
  };

  // Save ABI for frontend integration
  const frontendDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendDir, "TransplantChainLedger-MegaETH.json"),
    JSON.stringify(abiInfo, null, 2)
  );
  
  console.log("📄 Contract ABI saved to frontend directory");

  console.log("\n🎉 Deployment completed successfully on MegaETH!");
  console.log("📋 Contract Details:");
  console.log(`   Address: ${transplantLedger.address}`);
  console.log(`   Network: MegaETH Testnet`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Transaction: ${deploymentInfo.transactionHash}`);
  
  console.log("\n🌟 MegaETH Advantages:");
  console.log("   ✅ 512KB contract size limit (vs 24KB on Ethereum)");
  console.log("   ✅ Prague EVM compatibility");
  console.log("   ✅ High performance execution");
  console.log("   ✅ Lower gas costs");
  
  console.log("\n📝 Next Steps:");
  console.log("   1. Update your frontend with the new contract address");
  console.log("   2. Test the contract functions on MegaETH");
  console.log("   3. Monitor contract activity");
  console.log("   4. Deploy to MegaETH mainnet when available");

  console.log("\n🔗 Useful Links:");
  console.log("   📖 MegaETH Documentation: https://docs.megaeth.com");
  console.log("   🌐 MegaETH Website: https://megaeth.com");
  console.log("   💬 Community: Check MegaETH Discord/Telegram");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

