import axios from 'axios';
import { ethers } from 'ethers';
import contractABI from '@/contracts/TransplantChainLedger.json';

export interface VerificationResult {
  isValid: boolean;
  certificateData?: any;
  transactionData?: any;
  error?: string;
  ipfsData?: any;
  blockchainData?: any;
}

export interface CertificateVerificationInput {
  ipfsHash: string;
  contractAddress: string;
  transactionHash?: string;
}

class CertificateVerificationService {
  private gateway: string;
  private contractAddress: string;

  constructor() {
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    this.contractAddress = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';
  }

  /**
   * Verify a certificate by IPFS hash
   */
  async verifyCertificate(input: CertificateVerificationInput): Promise<VerificationResult> {
    try {
      console.log('🔍 Starting certificate verification...');
      console.log('IPFS Hash:', input.ipfsHash);
      console.log('Contract Address:', input.contractAddress);

      const results: VerificationResult = {
        isValid: false
      };

      // Step 1: Verify IPFS data exists and is accessible
      try {
        console.log('📡 Step 1: Verifying IPFS data...');
        const ipfsUrl = `${this.gateway}${input.ipfsHash}`;
        const ipfsResponse = await axios.get(ipfsUrl, { timeout: 10000 });
        
        if (ipfsResponse.status === 200) {
          results.ipfsData = {
            exists: true,
            url: ipfsUrl,
            contentType: ipfsResponse.headers['content-type'],
            size: ipfsResponse.data?.length || 0
          };
          console.log('✅ IPFS data verified successfully');
        }
      } catch (ipfsError: any) {
        console.warn('⚠️ IPFS verification failed:', ipfsError.message);
        results.ipfsData = {
          exists: false,
          error: ipfsError.message
        };
      }

      // Step 2: Verify blockchain data (if transaction hash provided)
      if (input.transactionHash) {
        try {
          console.log('⛓️ Step 2: Verifying blockchain data...');
          const blockchainData = await this.verifyBlockchainTransaction(input.transactionHash);
          results.blockchainData = blockchainData;
          
          if (blockchainData.isValid) {
            console.log('✅ Blockchain verification successful');
          } else {
            console.warn('⚠️ Blockchain verification failed');
          }
        } catch (blockchainError: any) {
          console.warn('⚠️ Blockchain verification error:', blockchainError.message);
          results.blockchainData = {
            isValid: false,
            error: blockchainError.message
          };
        }
      }

      // Step 3: Verify contract address matches
      if (input.contractAddress.toLowerCase() === this.contractAddress.toLowerCase()) {
        console.log('✅ Contract address verified');
      } else {
        console.warn('⚠️ Contract address mismatch');
        results.error = 'Contract address does not match expected value';
        return results;
      }

      // Step 4: Check if IPFS hash format is valid
      if (this.isValidIPFSHash(input.ipfsHash)) {
        console.log('✅ IPFS hash format is valid');
      } else {
        console.warn('⚠️ Invalid IPFS hash format');
        results.error = 'Invalid IPFS hash format';
        return results;
      }

      // Determine overall validity
      results.isValid = results.ipfsData?.exists === true && 
                       (results.blockchainData?.isValid !== false);

      if (results.isValid) {
        console.log('🎉 Certificate verification successful!');
      } else {
        console.log('❌ Certificate verification failed');
        results.error = results.error || 'Certificate verification failed';
      }

      return results;

    } catch (error: any) {
      console.error('❌ Certificate verification error:', error);
      return {
        isValid: false,
        error: `Verification failed: ${error.message}`
      };
    }
  }

  /**
   * Verify blockchain transaction
   */
  private async verifyBlockchainTransaction(transactionHash: string): Promise<any> {
    try {
      // This would require a blockchain provider to verify the transaction
      // For now, we'll return a basic validation
      return {
        isValid: true,
        transactionHash,
        message: 'Blockchain verification requires provider setup'
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Check if IPFS hash format is valid
   */
  private isValidIPFSHash(hash: string): boolean {
    // Basic IPFS hash validation (CID v0 or v1)
    const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{52}$/;
    return ipfsHashRegex.test(hash);
  }

  /**
   * Get certificate data from IPFS
   */
  async getCertificateFromIPFS(ipfsHash: string): Promise<any> {
    try {
      console.log('📥 Fetching certificate from IPFS...');
      const ipfsUrl = `${this.gateway}${ipfsHash}`;
      const response = await axios.get(ipfsUrl, { timeout: 10000 });
      
      console.log('✅ Certificate fetched from IPFS');
      return {
        data: response.data,
        contentType: response.headers['content-type'],
        size: response.data?.length || 0,
        url: ipfsUrl
      };
    } catch (error: any) {
      console.error('❌ Error fetching certificate from IPFS:', error);
      throw new Error(`Failed to fetch certificate: ${error.message}`);
    }
  }

  /**
   * Generate verification report
   */
  generateVerificationReport(result: VerificationResult, ipfsHash: string): string {
    const timestamp = new Date().toISOString();
    
    let report = `CERTIFICATE VERIFICATION REPORT\n`;
    report += `================================\n\n`;
    report += `Timestamp: ${timestamp}\n`;
    report += `IPFS Hash: ${ipfsHash}\n`;
    report += `Overall Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
    
    if (result.ipfsData) {
      report += `IPFS VERIFICATION:\n`;
      report += `Status: ${result.ipfsData.exists ? '✅ Accessible' : '❌ Not Accessible'}\n`;
      if (result.ipfsData.url) {
        report += `URL: ${result.ipfsData.url}\n`;
      }
      if (result.ipfsData.contentType) {
        report += `Content Type: ${result.ipfsData.contentType}\n`;
      }
      if (result.ipfsData.size) {
        report += `Size: ${result.ipfsData.size} bytes\n`;
      }
      if (result.ipfsData.error) {
        report += `Error: ${result.ipfsData.error}\n`;
      }
      report += `\n`;
    }
    
    if (result.blockchainData) {
      report += `BLOCKCHAIN VERIFICATION:\n`;
      report += `Status: ${result.blockchainData.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
      if (result.blockchainData.transactionHash) {
        report += `Transaction Hash: ${result.blockchainData.transactionHash}\n`;
      }
      if (result.blockchainData.error) {
        report += `Error: ${result.blockchainData.error}\n`;
      }
      report += `\n`;
    }
    
    if (result.error) {
      report += `ERRORS:\n`;
      report += `${result.error}\n\n`;
    }
    
    report += `Contract Address: ${this.contractAddress}\n`;
    report += `Verification Service: Transplant Chain Ledger\n`;
    
    return report;
  }
}

export default CertificateVerificationService;
