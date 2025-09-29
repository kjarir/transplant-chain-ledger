const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of TransplantChainLedger contract to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Get network info
  const network = await deployer.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());

  // Verify we're on Sepolia
  if (network.chainId.toString() !== "11155111") {
    throw new Error(`Expected Sepolia (Chain ID: 11155111), but got Chain ID: ${network.chainId}`);
  }

  // Deploy the contract
  const TransplantChainLedger = await ethers.getContractFactory("TransplantChainLedger");
  console.log("⏳ Deploying TransplantChainLedger to Sepolia...");
  
  const transplantLedger = await TransplantChainLedger.deploy();
  await transplantLedger.deployed();

  console.log("✅ TransplantChainLedger deployed to Sepolia!");
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
    networkType: "Ethereum Sepolia Testnet",
    features: [
      "Ethereum testnet compatibility",
      "Etherscan verification support", 
      "Standard EVM execution",
      "EVM compatible"
    ]
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  await transplantLedger.deployTransaction.wait(6);

  // Verify contract on Etherscan
  try {
    console.log("🔍 Attempting contract verification on Etherscan...");
    await hre.run("verify:verify", {
      address: transplantLedger.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully on Etherscan!");
  } catch (error) {
    console.log("❌ Contract verification failed:", error.message);
    console.log("📝 You can manually verify the contract on Etherscan using:");
    console.log(`   Contract Address: ${transplantLedger.address}`);
    console.log(`   Constructor Arguments: []`);
  }

  // Generate contract ABI and save to frontend
  const contractArtifact = await ethers.getContractFactory("TransplantChainLedger");
  const abi = contractArtifact.interface.format(ethers.utils.FormatTypes.json);
  
  const abiInfo = {
    contractAddress: transplantLedger.address,
    abi: JSON.parse(abi),
    network: "sepolia",
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    networkInfo: {
      name: "Ethereum Sepolia Testnet",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      chainId: 11155111,
      blockExplorer: "https://sepolia.etherscan.io"
    }
  };

  // Save ABI for frontend integration
  const frontendDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendDir, "TransplantChainLedger-Sepolia.json"),
    JSON.stringify(abiInfo, null, 2)
  );
  
  console.log("📄 Contract ABI saved to frontend directory");

  console.log("\n🎉 Deployment completed successfully on Sepolia!");
  console.log("📋 Contract Details:");
  console.log(`   Address: ${transplantLedger.address}`);
  console.log(`   Network: Ethereum Sepolia Testnet`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Transaction: ${deploymentInfo.transactionHash}`);
  
  console.log("\n🌟 Sepolia Advantages:");
  console.log("   ✅ Ethereum testnet compatibility");
  console.log("   ✅ Etherscan verification support");
  console.log("   ✅ Standard EVM execution");
  console.log("   ✅ Reliable testnet infrastructure");
  
  console.log("\n📝 Next Steps:");
  console.log("   1. Update your frontend with the new contract address");
  console.log("   2. Test the contract functions on Sepolia");
  console.log("   3. Monitor contract activity on Etherscan");
  console.log("   4. Deploy to Ethereum mainnet when ready");

  console.log("\n🔗 Useful Links:");
  console.log(`   🔍 Etherscan: https://sepolia.etherscan.io/address/${transplantLedger.address}`);
  console.log("   📖 Sepolia Faucet: https://sepoliafaucet.com/");
  console.log("   🌐 Sepolia Documentation: https://ethereum.org/en/developers/docs/networks/#sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
