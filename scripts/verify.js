const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification process...");

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  const deploymentFiles = fs.readdirSync(deploymentsDir).filter(file => file.endsWith('.json'));
  
  if (deploymentFiles.length === 0) {
    console.error("❌ No deployment files found. Please deploy the contract first.");
    process.exit(1);
  }

  // Get the most recent deployment
  const latestDeployment = deploymentFiles.sort().pop();
  const deploymentPath = path.join(deploymentsDir, latestDeployment);
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  console.log("📄 Found deployment:", latestDeployment);
  console.log("📍 Contract Address:", deploymentInfo.contractAddress);
  console.log("🌐 Network:", deploymentInfo.network.name);

  try {
    // Verify the contract
    console.log("⏳ Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: deploymentInfo.constructorArgs || [],
    });
    
    console.log("✅ Contract verified successfully!");
    
    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTime = new Date().toISOString();
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Verification status saved to deployment file");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    // Check if contract is already verified
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contract is already verified on Etherscan");
      deploymentInfo.verified = true;
      deploymentInfo.verificationTime = new Date().toISOString();
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    } else {
      deploymentInfo.verified = false;
      deploymentInfo.verificationError = error.message;
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    }
  }

  // Generate verification report
  const report = {
    contractAddress: deploymentInfo.contractAddress,
    network: deploymentInfo.network.name,
    chainId: deploymentInfo.network.chainId,
    verified: deploymentInfo.verified || false,
    verificationTime: deploymentInfo.verificationTime || null,
    error: deploymentInfo.verificationError || null,
    etherscanUrl: getEtherscanUrl(deploymentInfo.network.chainId, deploymentInfo.contractAddress)
  };

  console.log("\n📊 Verification Report:");
  console.log(JSON.stringify(report, null, 2));
}

function getEtherscanUrl(chainId, contractAddress) {
  const urls = {
    1: "https://etherscan.io", // Ethereum Mainnet
    5: "https://goerli.etherscan.io", // Goerli Testnet
    11155111: "https://sepolia.etherscan.io", // Sepolia Testnet
    137: "https://polygonscan.com", // Polygon
    80001: "https://mumbai.polygonscan.com", // Mumbai Testnet
    56: "https://bscscan.com", // BSC
    97: "https://testnet.bscscan.com", // BSC Testnet
  };
  
  const baseUrl = urls[chainId];
  return baseUrl ? `${baseUrl}/address/${contractAddress}` : "Network not supported";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification process failed:", error);
    process.exit(1);
  });
