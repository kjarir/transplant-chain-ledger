import React from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WalletConnection: React.FC = () => {
  const {
    isConnected,
    account,
    connectWallet,
    loading,
    error
  } = useBlockchain();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your wallet is connected and ready to interact with the smart contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Address:</span> {formatAddress(account)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Contract:</span> 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Connect your Web3 wallet to interact with the TransplantChain smart contract
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To use the blockchain features, you need to connect a Web3 wallet like MetaMask.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Register users on the blockchain</li>
            <li>• Create organ requests and donations</li>
            <li>• Track all transactions transparently</li>
            <li>• Verify medical records immutably</li>
          </ul>
        </div>

        <Button 
          onClick={handleConnect}
          disabled={loading}
          className="w-full"
          variant="default"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Contract Address: 0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
