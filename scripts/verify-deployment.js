import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentVerifier {
  constructor() {
    this.contractAddress = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';
    this.pinataUploads = {
      smartContract: 'QmTe2x8UDG3d3rje4iEtYRzf2xP4DjVvnJPbUrk2hoPCjr',
      documentation: 'QmVRKZaBTqYtmAJpxW2sHvmytsFf1p4Rz7HAhrzCHDtroX',
      metadata: 'QmNyDsZoBi5wVpzHnvECpaKv1u4vvpxo9AeykfwkyWjsQJ',
      projectSummary: 'QmXGXpcv8YTcQXe63FTEPBTvcjwB6ps5NPgepriFLa9D96'
    };
  }

  async verifyPinataUploads() {
    console.log('🔍 Verifying Pinata IPFS uploads...');
    
    const results = {};
    
    for (const [type, hash] of Object.entries(this.pinataUploads)) {
      try {
        const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        if (response.status === 200) {
          console.log(`✅ ${type}: Accessible at ${url}`);
          results[type] = { status: 'accessible', url, hash };
        } else {
          console.log(`❌ ${type}: Not accessible (Status: ${response.status})`);
          results[type] = { status: 'inaccessible', url, hash };
        }
      } catch (error) {
        console.log(`❌ ${type}: Error accessing ${hash} - ${error.message}`);
        results[type] = { status: 'error', error: error.message, hash };
      }
    }
    
    return results;
  }

  async verifyContractMetadata() {
    console.log('\n📊 Verifying contract metadata...');
    
    try {
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${this.pinataUploads.metadata}`;
      const response = await axios.get(metadataUrl);
      
      if (response.status === 200) {
        const metadata = response.data;
        console.log('✅ Contract metadata accessible');
        console.log(`   Contract Address: ${metadata.contractAddress}`);
        console.log(`   Contract Name: ${metadata.contractName}`);
        console.log(`   Compiler Version: ${metadata.compilerVersion}`);
        console.log(`   Features: ${metadata.features.length} features listed`);
        
        return {
          status: 'success',
          metadata: metadata,
          url: metadataUrl
        };
      }
    } catch (error) {
      console.log(`❌ Contract metadata error: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  async verifyProjectSummary() {
    console.log('\n📋 Verifying project summary...');
    
    try {
      const summaryUrl = `https://gateway.pinata.cloud/ipfs/${this.pinataUploads.projectSummary}`;
      const response = await axios.get(summaryUrl);
      
      if (response.status === 200) {
        const summary = response.data;
        console.log('✅ Project summary accessible');
        console.log(`   Project Name: ${summary.projectName}`);
        console.log(`   Version: ${summary.version}`);
        console.log(`   Technologies: ${summary.technology.join(', ')}`);
        console.log(`   Networks: ${summary.networks.join(', ')}`);
        
        return {
          status: 'success',
          summary: summary,
          url: summaryUrl
        };
      }
    } catch (error) {
      console.log(`❌ Project summary error: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  async verifyDocumentation() {
    console.log('\n📚 Verifying documentation...');
    
    try {
      const docUrl = `https://gateway.pinata.cloud/ipfs/${this.pinataUploads.documentation}`;
      const response = await axios.get(docUrl);
      
      if (response.status === 200) {
        const content = response.data;
        console.log('✅ Documentation accessible');
        console.log(`   Content length: ${content.length} characters`);
        console.log(`   Contains contract info: ${content.includes('TransplantChainLedger')}`);
        console.log(`   Contains deployment guide: ${content.includes('Deployment Guide')}`);
        
        return {
          status: 'success',
          contentLength: content.length,
          url: docUrl
        };
      }
    } catch (error) {
      console.log(`❌ Documentation error: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  async verifySmartContract() {
    console.log('\n📜 Verifying smart contract source...');
    
    try {
      const contractUrl = `https://gateway.pinata.cloud/ipfs/${this.pinataUploads.smartContract}`;
      const response = await axios.get(contractUrl);
      
      if (response.status === 200) {
        const source = response.data;
        console.log('✅ Smart contract source accessible');
        console.log(`   Source length: ${source.length} characters`);
        console.log(`   Contains SPDX license: ${source.includes('SPDX-License-Identifier')}`);
        console.log(`   Contains pragma: ${source.includes('pragma solidity')}`);
        console.log(`   Contains constructor fix: ${source.includes('Ownable(msg.sender)')}`);
        
        return {
          status: 'success',
          sourceLength: source.length,
          url: contractUrl
        };
      }
    } catch (error) {
      console.log(`❌ Smart contract error: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  async generateVerificationReport() {
    console.log('🚀 TransplantChainLedger Deployment Verification Report');
    console.log('=' .repeat(60));
    console.log(`📍 Contract Address: ${this.contractAddress}`);
    console.log(`📅 Verification Date: ${new Date().toISOString()}`);
    console.log('=' .repeat(60));

    const pinataResults = await this.verifyPinataUploads();
    const metadataResult = await this.verifyContractMetadata();
    const summaryResult = await this.verifyProjectSummary();
    const docResult = await this.verifyDocumentation();
    const contractResult = await this.verifySmartContract();

    const report = {
      contractAddress: this.contractAddress,
      verificationDate: new Date().toISOString(),
      pinataUploads: pinataResults,
      metadata: metadataResult,
      projectSummary: summaryResult,
      documentation: docResult,
      smartContract: contractResult,
      overallStatus: this.calculateOverallStatus([
        pinataResults,
        metadataResult,
        summaryResult,
        docResult,
        contractResult
      ])
    };

    // Save verification report
    const reportPath = path.join(__dirname, '../deployments', 'verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Verification Summary:');
    console.log(`   Overall Status: ${report.overallStatus}`);
    console.log(`   Pinata Uploads: ${Object.values(pinataResults).filter(r => r.status === 'accessible').length}/4 accessible`);
    console.log(`   Metadata: ${metadataResult.status}`);
    console.log(`   Documentation: ${docResult.status}`);
    console.log(`   Smart Contract: ${contractResult.status}`);
    
    console.log(`\n💾 Verification report saved to: ${reportPath}`);
    
    return report;
  }

  calculateOverallStatus(results) {
    const allResults = results.flat();
    const successCount = allResults.filter(r => r.status === 'success' || r.status === 'accessible').length;
    const totalCount = allResults.length;
    
    if (successCount === totalCount) return 'SUCCESS';
    if (successCount > totalCount / 2) return 'PARTIAL';
    return 'FAILED';
  }
}

async function main() {
  try {
    const verifier = new DeploymentVerifier();
    const report = await verifier.generateVerificationReport();
    
    console.log('\n🎉 Verification completed!');
    
    if (report.overallStatus === 'SUCCESS') {
      console.log('\n✅ All verifications passed! Your deployment is ready.');
      console.log('\n📝 Next Steps:');
      console.log('   1. Contract is live at: 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B');
      console.log('   2. All files are accessible on IPFS');
      console.log('   3. Update your frontend with contract address');
      console.log('   4. Test contract functions');
      console.log('   5. Deploy to production networks when ready');
    } else if (report.overallStatus === 'PARTIAL') {
      console.log('\n⚠️  Some verifications failed. Check the report above.');
    } else {
      console.log('\n❌ Verification failed. Please check your deployment.');
    }
    
  } catch (error) {
    console.error('❌ Verification process failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DeploymentVerifier };
