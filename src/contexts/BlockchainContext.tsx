import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '@/contracts/TransplantChainLedger.json';

interface BlockchainContextType {
  contract: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  registerUserOnBlockchain: (userData: any) => Promise<any>;
  createOrganRequest: (requestData: any) => Promise<any>;
  createOrganDonation: (donationData: any) => Promise<any>;
  getUserRequests: (userAddress: string) => Promise<any>;
  getUserDonations: (userAddress: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await initializeProvider(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        await initializeProvider(accounts[0]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeProvider = async (accountAddress: string) => {
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      
      // Initialize contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(accountAddress);
      setIsConnected(true);
      
      console.log('Blockchain connected:', accountAddress);
    } catch (error) {
      console.error('Error initializing provider:', error);
      setError('Failed to initialize blockchain connection');
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      initializeProvider(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
    setError(null);
  };

  // Blockchain interaction functions
  const registerUserOnBlockchain = async (userData: any) => {
    if (!contract || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      // Convert role string to enum value
      const roleMap = {
        'patient': 0,
        'donor': 1,
        'doctor': 2,
        'admin': 3
      };

      const roleValue = roleMap[userData.role as keyof typeof roleMap] || 0;
      
      // Convert date to timestamp
      const dateOfBirth = userData.date_of_birth ? 
        Math.floor(new Date(userData.date_of_birth).getTime() / 1000) : 
        Math.floor(Date.now() / 1000) - 86400 * 365 * 30; // Default to 30 years ago

      const tx = await contract.registerUser(
        userData.full_name || '',
        roleValue,
        userData.phone || '',
        userData.address || '',
        dateOfBirth,
        userData.blood_type || '',
        userData.medical_history || '',
        userData.emergency_contact || ''
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.transactionHash };
    } catch (error: any) {
      console.error('Error registering user on blockchain:', error);
      throw new Error(error.message || 'Failed to register user on blockchain');
    } finally {
      setLoading(false);
    }
  };

  const createOrganRequest = async (requestData: any) => {
    if (!contract || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const organTypeMap = {
        'heart': 0,
        'kidney': 1,
        'liver': 2,
        'lung': 3,
        'pancreas': 4,
        'cornea': 5,
        'bone': 6,
        'skin': 7
      };

      const organTypeValue = organTypeMap[requestData.organ_type as keyof typeof organTypeMap] || 0;

      const tx = await contract.createOrganRequest(
        organTypeValue,
        requestData.urgency_level || 3,
        requestData.medical_condition || '',
        requestData.doctor_notes || ''
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.transactionHash };
    } catch (error: any) {
      console.error('Error creating organ request:', error);
      throw new Error(error.message || 'Failed to create organ request');
    } finally {
      setLoading(false);
    }
  };

  const createOrganDonation = async (donationData: any) => {
    if (!contract || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const organTypeMap = {
        'heart': 0,
        'kidney': 1,
        'liver': 2,
        'lung': 3,
        'pancreas': 4,
        'cornea': 5,
        'bone': 6,
        'skin': 7
      };

      const organTypeValue = organTypeMap[donationData.organ_type as keyof typeof organTypeMap] || 0;

      const tx = await contract.createOrganDonation(organTypeValue);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.transactionHash };
    } catch (error: any) {
      console.error('Error creating organ donation:', error);
      throw new Error(error.message || 'Failed to create organ donation');
    } finally {
      setLoading(false);
    }
  };

  const getUserRequests = async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const requestIds = await contract.getUserRequests(userAddress);
      const requests = [];
      
      for (const id of requestIds) {
        const request = await contract.getOrganRequest(id);
        requests.push(request);
      }
      
      return requests;
    } catch (error: any) {
      console.error('Error fetching user requests:', error);
      throw new Error(error.message || 'Failed to fetch user requests');
    }
  };

  const getUserDonations = async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const donationIds = await contract.getUserDonations(userAddress);
      const donations = [];
      
      for (const id of donationIds) {
        const donation = await contract.getOrganDonation(id);
        donations.push(donation);
      }
      
      return donations;
    } catch (error: any) {
      console.error('Error fetching user donations:', error);
      throw new Error(error.message || 'Failed to fetch user donations');
    }
  };

  const value = {
    contract,
    provider,
    signer,
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    registerUserOnBlockchain,
    createOrganRequest,
    createOrganDonation,
    getUserRequests,
    getUserDonations,
    loading,
    error
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
