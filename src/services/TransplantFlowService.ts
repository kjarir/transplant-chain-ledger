import TransactionService, { TransplantTransaction, CertificateData } from './TransactionService';
import CertificateService from './CertificateService';
import PinataService, { PinataUploadResult } from './PinataService';
import { ethers } from 'ethers';

export interface TransplantFlowResult {
  success: boolean;
  transaction: TransplantTransaction;
  certificateData: CertificateData;
  certificateHTML: string;
  ipfsResults: {
    certificate: PinataUploadResult;
    metadata: PinataUploadResult;
  };
  certificateUrl: string;
  metadataUrl: string;
}

export interface TransplantFlowInput {
  requestId: number;
  donationId: number;
  patientEmail: string;
  donorEmail: string;
  organType: string;
  transplantDate: string;
  hospitalName: string;
  doctorNotes: string;
  patientName: string;
  donorName: string;
  doctorName: string;
}

class TransplantFlowService {
  private transactionService: TransactionService | null = null;
  private certificateService: CertificateService;
  private pinataService: PinataService;

  constructor() {
    this.certificateService = new CertificateService();
    this.pinataService = new PinataService();
  }

  /**
   * Initialize with blockchain connection
   */
  initialize(contract: ethers.Contract, signer: ethers.JsonRpcSigner) {
    this.transactionService = new TransactionService(contract, signer);
  }

  /**
   * Complete transplant flow: Record → Generate Certificate → Upload to IPFS
   */
  async completeTransplantFlow(input: TransplantFlowInput): Promise<TransplantFlowResult> {
    if (!this.transactionService) {
      throw new Error('TransplantFlowService not initialized. Call initialize() first.');
    }

    console.log('🚀 Starting complete transplant flow...');
    console.log('📍 Contract Address: 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B');

    try {
      // Step 1: Get user addresses from emails (or use doctor's address for now)
      console.log('📝 Step 1: Recording transaction on blockchain...');
      
      // For now, we'll use the doctor's address as the patient and donor addresses
      // In a real implementation, you'd look up the wallet addresses from the email addresses
      const doctorAddress = await this.transactionService.signer!.getAddress();
      
      const transaction = await this.transactionService.recordTransaction({
        requestId: input.requestId,
        donationId: input.donationId,
        patientAddress: doctorAddress, // Using doctor's address for now
        donorAddress: doctorAddress,   // Using doctor's address for now
        organType: input.organType,
        transplantDate: input.transplantDate,
        hospitalName: input.hospitalName,
        doctorNotes: input.doctorNotes
      });

      console.log('✅ Transaction recorded successfully!');
      console.log(`🔗 Transaction Hash: ${transaction.txHash}`);

      // Step 2: Generate certificate data
      console.log('📜 Step 2: Generating certificate...');
      const certificateData = this.certificateService.generateCertificateData(
        transaction,
        input.patientName,
        input.donorName,
        input.doctorName
      );

      console.log(`✅ Certificate generated: ${certificateData.certificateNumber}`);

      // Step 3: Generate certificate HTML
      console.log('🎨 Step 3: Generating certificate HTML...');
      const certificateHTML = this.certificateService.generateHTMLCertificate(certificateData);

      console.log('✅ Certificate HTML generated');

      // Step 4: Upload certificate to Pinata IPFS
      console.log('☁️ Step 4: Uploading certificate to IPFS...');
      const certificateUpload = await this.pinataService.uploadCertificate(certificateHTML, {
        certificateNumber: certificateData.certificateNumber,
        patientName: input.patientName,
        donorName: input.donorName,
        organType: input.organType,
        transactionHash: transaction.txHash,
        patientEmail: input.patientEmail,
        donorEmail: input.donorEmail
      });

      console.log('✅ Certificate uploaded to IPFS!');
      console.log(`🔗 Certificate URL: ${certificateUpload.url}`);

      // Step 5: Upload certificate metadata to Pinata IPFS
      console.log('📊 Step 5: Uploading certificate metadata to IPFS...');
      const metadataUpload = await this.pinataService.uploadCertificateMetadata(
        certificateData,
        certificateUpload.hash
      );

      console.log('✅ Certificate metadata uploaded to IPFS!');
      console.log(`🔗 Metadata URL: ${metadataUpload.url}`);

      // Step 6: Verify uploads
      console.log('🔍 Step 6: Verifying uploads...');
      const certificateVerified = await this.pinataService.verifyCertificateUpload(certificateUpload.hash);
      const metadataVerified = await this.pinataService.verifyCertificateUpload(metadataUpload.hash);

      if (certificateVerified && metadataVerified) {
        console.log('✅ All uploads verified successfully!');
      } else {
        console.warn('⚠️ Some uploads could not be verified');
      }

      const result: TransplantFlowResult = {
        success: true,
        transaction,
        certificateData,
        certificateHTML,
        ipfsResults: {
          certificate: certificateUpload,
          metadata: metadataUpload
        },
        certificateUrl: certificateUpload.url,
        metadataUrl: metadataUpload.url
      };

      console.log('🎉 Complete transplant flow finished successfully!');
      console.log('📋 Summary:');
      console.log(`   📝 Transaction: ${transaction.txHash}`);
      console.log(`   📜 Certificate: ${certificateData.certificateNumber}`);
      console.log(`   🔗 Certificate URL: ${certificateUpload.url}`);
      console.log(`   📊 Metadata URL: ${metadataUpload.url}`);

      return result;

    } catch (error: any) {
      console.error('❌ Transplant flow failed:', error.message);
      throw new Error(`Transplant flow failed: ${error.message}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(transactionId: number): Promise<any> {
    if (!this.transactionService) {
      throw new Error('TransplantFlowService not initialized');
    }
    return await this.transactionService.getTransactionDetails(transactionId);
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userAddress: string): Promise<any[]> {
    if (!this.transactionService) {
      throw new Error('TransplantFlowService not initialized');
    }
    return await this.transactionService.getUserTransactions(userAddress);
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    if (!this.transactionService) {
      throw new Error('TransplantFlowService not initialized');
    }
    return await this.transactionService.verifyTransaction(txHash);
  }

  /**
   * Get certificate from IPFS
   */
  async getCertificateFromIPFS(hash: string): Promise<string> {
    return await this.pinataService.getCertificate(hash);
  }

  /**
   * Get certificate metadata from IPFS
   */
  async getCertificateMetadataFromIPFS(hash: string): Promise<any> {
    return await this.pinataService.getCertificateMetadata(hash);
  }

  /**
   * Download certificate as HTML file
   */
  downloadCertificate(certificateHTML: string, certificateNumber: string): void {
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificateNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Print certificate
   */
  printCertificate(certificateHTML: string): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }
}

export default TransplantFlowService;
