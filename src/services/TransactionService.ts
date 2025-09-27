import { ethers } from 'ethers';
import contractABI from '@/contracts/TransplantChainLedger.json';

export interface TransplantTransaction {
  requestId: number;
  donationId: number;
  patientAddress: string;
  donorAddress: string;
  organType: string;
  transplantDate: string;
  hospitalName: string;
  doctorAddress: string;
  txHash: string;
  blockNumber: number;
}

export interface CertificateData {
  transactionId: string;
  patientName: string;
  donorName: string;
  organType: string;
  transplantDate: string;
  hospitalName: string;
  doctorName: string;
  blockchainHash: string;
  certificateNumber: string;
  timestamp: string;
}

class TransactionService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor(contract: ethers.Contract, signer: ethers.JsonRpcSigner) {
    this.contract = contract;
    this.signer = signer;
  }

  /**
   * Register user on the blockchain contract
   */
  private async registerUserOnContract(): Promise<void> {
    try {
      const currentUserAddress = await this.signer.getAddress();
      
      // Register user with default doctor role and minimal data
      const tx = await this.contract.registerUser(
        'Doctor User', // fullName
        2, // UserRole.DOCTOR
        '', // phone
        '', // physicalAddress
        0, // dateOfBirth
        '', // bloodType
        '', // medicalHistory
        '' // emergencyContact
      );
      
      await tx.wait();
      console.log('✅ User registered on contract successfully');
    } catch (error: any) {
      console.error('❌ Error registering user on contract:', error);
      throw error;
    }
  }

  /**
   * Record a transplant transaction on the blockchain
   */
  async recordTransaction(transactionData: {
    requestId: number;
    donationId: number;
    patientAddress: string;
    donorAddress: string;
    organType: string;
    transplantDate: string;
    hospitalName: string;
    doctorNotes: string;
  }): Promise<TransplantTransaction> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized');
    }

    try {
      // Convert organ type to enum
      const organTypeMap: { [key: string]: number } = {
        'heart': 0, 'kidney': 1, 'liver': 2, 'lung': 3,
        'pancreas': 4, 'cornea': 5, 'bone': 6, 'skin': 7
      };

      const organTypeValue = organTypeMap[transactionData.organType.toLowerCase()] || 0;
      
      // Debug: Check what functions are available on the contract
      console.log('Contract instance:', this.contract);
      console.log('Available contract methods:', Object.getOwnPropertyNames(this.contract));
      console.log('recordTransaction method exists:', typeof this.contract.recordTransaction);
      
      // Check if user is registered (recordTransaction requires onlyRegisteredUser)
      const currentUserAddress = await this.signer.getAddress();
      console.log('Current user address:', currentUserAddress);
      
      try {
        const userInfo = await this.contract.getUser(currentUserAddress);
        console.log('User info from contract:', userInfo);
      } catch (error) {
        console.log('User not registered on contract, attempting to register...');
        // Try to register user first
        await this.registerUserOnContract();
      }
      
      // Generate a transaction hash
      const transactionHash = `transplant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transactionType = 'transplant';
      const status = 'completed';
      const metadata = JSON.stringify({
        organType: transactionData.organType,
        transplantDate: transactionData.transplantDate,
        hospitalName: transactionData.hospitalName,
        doctorNotes: transactionData.doctorNotes
      });
      
      console.log('Calling recordTransaction with params:', {
        transactionHash,
        transactionType,
        patientAddress: transactionData.patientAddress,
        donorAddress: transactionData.donorAddress,
        requestId: transactionData.requestId,
        donationId: transactionData.donationId,
        status,
        metadata
      });
      
      // Record transaction on blockchain using the actual contract function
      const tx = await this.contract.recordTransaction(
        transactionHash,
        transactionType,
        transactionData.patientAddress,
        transactionData.donorAddress,
        transactionData.requestId,
        transactionData.donationId,
        status,
        metadata
      );

      const receipt = await tx.wait();
      
      // Extract transaction details
      const transaction: TransplantTransaction = {
        requestId: transactionData.requestId,
        donationId: transactionData.donationId,
        patientAddress: transactionData.patientAddress,
        donorAddress: transactionData.donorAddress,
        organType: transactionData.organType,
        transplantDate: transactionData.transplantDate,
        hospitalName: transactionData.hospitalName,
        doctorAddress: await this.signer.getAddress(),
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };

      console.log('✅ Transplant transaction recorded on blockchain:', transaction);
      return transaction;

    } catch (error: any) {
      console.error('❌ Error recording transplant transaction:', error);
      throw new Error(`Failed to record transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction details from blockchain
   */
  async getTransactionDetails(transactionId: number): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const transaction = await this.contract.getTransaction(transactionId);
      return transaction;
    } catch (error: any) {
      console.error('❌ Error fetching transaction:', error);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userAddress: string): Promise<any[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const transactionIds = await this.contract.getUserTransactions(userAddress);
      const transactions = [];
      
      for (const id of transactionIds) {
        const transaction = await this.contract.getTransaction(id);
        transactions.push(transaction);
      }
      
      return transactions;
    } catch (error: any) {
      console.error('❌ Error fetching user transactions:', error);
      throw new Error(`Failed to fetch user transactions: ${error.message}`);
    }
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      const provider = this.signer.provider;
      const receipt = await provider!.getTransactionReceipt(txHash);
      
      if (receipt && receipt.status === 1) {
        console.log('✅ Transaction verified on blockchain');
        return true;
      } else {
        console.log('❌ Transaction verification failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error verifying transaction:', error);
      return false;
    }
  }
}

export default TransactionService;
