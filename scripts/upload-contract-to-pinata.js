import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

class PinataUploader {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.secretKey = process.env.PINATA_SECRET_API_KEY;
    this.jwt = process.env.PINATA_JWT;
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Pinata API keys not found. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in your .env file');
    }
  }

  async uploadFile(filePath, metadata = {}) {
    try {
      console.log(`📤 Uploading file: ${filePath}`);
      
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      
      formData.append('file', fileStream);
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || path.basename(filePath),
        keyvalues: {
          type: metadata.type || 'documentation',
          project: 'transplant-chain-ledger',
          version: metadata.version || '1.0.0',
          contractAddress: '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B',
          ...metadata.keyvalues
        }
      }));
      
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 0
      }));

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey,
          ...formData.getHeaders()
        }
      });

      const { IpfsHash, PinSize, Timestamp } = response.data;
      
      console.log('✅ File uploaded successfully!');
      console.log(`🔗 IPFS Hash: ${IpfsHash}`);
      console.log(`📏 Size: ${PinSize} bytes`);
      console.log(`🌐 Access URL: ${this.gateway}${IpfsHash}`);
      
      return {
        hash: IpfsHash,
        size: PinSize,
        timestamp: Timestamp,
        url: `${this.gateway}${IpfsHash}`
      };
      
    } catch (error) {
      console.error('❌ Upload failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadJSON(data, metadata = {}) {
    try {
      console.log('📤 Uploading JSON data...');
      
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataContent: data,
        pinataMetadata: {
          name: metadata.name || 'data.json',
          keyvalues: {
            type: metadata.type || 'json',
            project: 'transplant-chain-ledger',
            contractAddress: '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B',
            ...metadata.keyvalues
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      }, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey,
          'Content-Type': 'application/json'
        }
      });

      const { IpfsHash, PinSize, Timestamp } = response.data;
      
      console.log('✅ JSON uploaded successfully!');
      console.log(`🔗 IPFS Hash: ${IpfsHash}`);
      console.log(`🌐 Access URL: ${this.gateway}${IpfsHash}`);
      
      return {
        hash: IpfsHash,
        size: PinSize,
        timestamp: Timestamp,
        url: `${this.gateway}${IpfsHash}`
      };
      
    } catch (error) {
      console.error('❌ JSON upload failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadContractFiles() {
    try {
      console.log('🚀 Starting contract files upload to Pinata...');
      console.log('📍 Contract Address: 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B');
      
      const uploadResults = [];
      const contractPath = path.join(__dirname, '../contracts/TransplantChainLedger.sol');
      const docPath = path.join(__dirname, '../docs/TransplantChainLedger-Documentation.md');
      
      // 1. Upload Smart Contract
      if (fs.existsSync(contractPath)) {
        console.log('\n📄 Uploading Smart Contract...');
        const contractResult = await this.uploadFile(contractPath, {
          name: 'TransplantChainLedger.sol',
          type: 'smart-contract',
          version: '1.0.0'
        });
        uploadResults.push({
          type: 'smart-contract',
          file: 'TransplantChainLedger.sol',
          ...contractResult
        });
      }
      
      // 2. Upload Documentation
      if (fs.existsSync(docPath)) {
        console.log('\n📚 Uploading Documentation...');
        const docResult = await this.uploadFile(docPath, {
          name: 'TransplantChainLedger-Documentation.md',
          type: 'documentation',
          version: '1.0.0'
        });
        uploadResults.push({
          type: 'documentation',
          file: 'TransplantChainLedger-Documentation.md',
          ...docResult
        });
      }
      
      // 3. Upload Contract Metadata
      console.log('\n📊 Uploading Contract Metadata...');
      const contractMetadata = {
        contractAddress: '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B',
        contractName: 'TransplantChainLedger',
        deploymentTime: new Date().toISOString(),
        network: 'Deployed Network',
        chainId: 'Unknown',
        compilerVersion: '0.8.19',
        constructorArgs: [],
        features: [
          'Organ donation tracking',
          'Patient request management',
          'Medical verification system',
          'Automated matching algorithm',
          'Role-based access control',
          'IPFS document storage',
          'Blockchain transparency'
        ],
        uploadResults: uploadResults,
        verification: {
          status: 'pending',
          blockExplorer: 'Check network-specific explorer',
          verifiedAt: null
        }
      };
      
      const metadataResult = await this.uploadJSON(contractMetadata, {
        name: 'contract-metadata.json',
        type: 'metadata'
      });
      
      uploadResults.push({
        type: 'metadata',
        file: 'contract-metadata.json',
        ...metadataResult
      });
      
      // 4. Upload Project Summary
      console.log('\n📋 Uploading Project Summary...');
      const projectSummary = {
        projectName: 'Transplant Chain Ledger',
        description: 'Blockchain-based organ donation and transplant tracking system',
        version: '1.0.0',
        technology: ['Solidity', 'React', 'TypeScript', 'Supabase', 'IPFS'],
        networks: ['Ethereum', 'Polygon', 'BSC', 'MegaETH'],
        contractAddress: '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B',
        uploadDate: new Date().toISOString(),
        files: uploadResults,
        github: 'https://github.com/kjarir/transplant-chain-ledger',
        documentation: uploadResults.find(r => r.type === 'documentation')?.url,
        smartContract: uploadResults.find(r => r.type === 'smart-contract')?.url
      };
      
      const summaryResult = await this.uploadJSON(projectSummary, {
        name: 'project-summary.json',
        type: 'summary'
      });
      
      uploadResults.push({
        type: 'summary',
        file: 'project-summary.json',
        ...summaryResult
      });
      
      // Save upload results
      const resultsPath = path.join(__dirname, '../deployments', 'pinata-uploads.json');
      const deploymentsDir = path.dirname(resultsPath);
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
      }
      
      const finalResults = {
        contractAddress: '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B',
        uploadDate: new Date().toISOString(),
        results: uploadResults,
        metadata: contractMetadata
      };
      
      fs.writeFileSync(resultsPath, JSON.stringify(finalResults, null, 2));
      
      console.log('\n🎉 All files uploaded successfully!');
      console.log('📋 Upload Summary:');
      uploadResults.forEach(result => {
        console.log(`   ${result.type}: ${result.url}`);
      });
      
      console.log(`\n💾 Upload results saved to: ${resultsPath}`);
      
      // Update contract deployment file
      const deploymentPath = path.join(__dirname, '../deployments/contract-deployment.json');
      if (fs.existsSync(deploymentPath)) {
        const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        deploymentData.pinataUploaded = true;
        deploymentData.uploadResults = uploadResults;
        deploymentData.uploadDate = new Date().toISOString();
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
      }
      
      return uploadResults;
      
    } catch (error) {
      console.error('❌ Contract upload failed:', error.message);
      throw error;
    }
  }

  async verifyUpload(hash) {
    try {
      console.log(`🔍 Verifying upload: ${hash}`);
      
      const response = await axios.get(`https://api.pinata.cloud/data/pinList?hashContains=${hash}`, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      });
      
      const pins = response.data.rows;
      if (pins.length > 0) {
        console.log('✅ Upload verified successfully!');
        console.log(`📊 Pinned files: ${pins.length}`);
        pins.forEach(pin => {
          console.log(`   - ${pin.metadata.name}: ${pin.ipfs_pin_hash}`);
        });
        return true;
      } else {
        console.log('❌ Upload not found');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Verification failed:', error.response?.data || error.message);
      return false;
    }
  }
}

async function main() {
  try {
    const uploader = new PinataUploader();
    
    console.log('🚀 TransplantChainLedger Contract Upload to Pinata IPFS');
    console.log('📍 Contract Address: 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B');
    console.log('🌐 Pinata Gateway: https://gateway.pinata.cloud/ipfs/');
    
    // Upload all contract files
    const results = await uploader.uploadContractFiles();
    
    // Verify uploads
    console.log('\n🔍 Verifying uploads...');
    for (const result of results) {
      await uploader.verifyUpload(result.hash);
    }
    
    console.log('\n✨ Process completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Contract is deployed at: 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B');
    console.log('   2. All files uploaded to IPFS');
    console.log('   3. Update your frontend with contract address');
    console.log('   4. Test contract functions');
    
    console.log('\n🔗 Useful Links:');
    console.log(`   📄 Documentation: ${results.find(r => r.type === 'documentation')?.url}`);
    console.log(`   📜 Smart Contract: ${results.find(r => r.type === 'smart-contract')?.url}`);
    console.log(`   📊 Metadata: ${results.find(r => r.type === 'metadata')?.url}`);
    console.log(`   📋 Project Summary: ${results.find(r => r.type === 'summary')?.url}`);
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PinataUploader };
