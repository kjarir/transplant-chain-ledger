// Wallet utility functions

export const isWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const getWalletName = (): string => {
  if (!isWalletInstalled()) return 'No wallet detected';
  
  if (window.ethereum.isMetaMask) return 'MetaMask';
  if (window.ethereum.isCoinbaseWallet) return 'Coinbase Wallet';
  if (window.ethereum.isBraveWallet) return 'Brave Wallet';
  
  return 'Unknown Web3 Wallet';
};

export const getCurrentNetwork = async (): Promise<string | null> => {
  if (!isWalletInstalled()) return null;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

export const getWalletAccounts = async (): Promise<string[]> => {
  if (!isWalletInstalled()) return [];
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
};

export const requestWalletConnection = async (): Promise<string[]> => {
  if (!isWalletInstalled()) {
    throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request.');
    } else if (error.code === -32002) {
      throw new Error('Connection request already pending. Please check your wallet.');
    } else {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }
};

export const switchNetwork = async (chainId: string): Promise<void> => {
  if (!isWalletInstalled()) {
    throw new Error('No wallet detected');
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error(`Network with chainId ${chainId} not found. Please add it to your wallet.`);
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
};

export const getWalletInfo = async () => {
  const installed = isWalletInstalled();
  const name = getWalletName();
  const network = await getCurrentNetwork();
  const accounts = await getWalletAccounts();
  
  return {
    installed,
    name,
    network,
    accounts,
    connected: accounts.length > 0
  };
};
