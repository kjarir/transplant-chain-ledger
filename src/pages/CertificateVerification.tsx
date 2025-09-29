import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Download, Copy, ExternalLink } from 'lucide-react';
import CertificateVerificationService, { VerificationResult } from '@/services/CertificateVerificationService';

const CertificateVerification: React.FC = () => {
  const { ipfsHash } = useParams<{ ipfsHash: string }>();
  const [searchParams] = useSearchParams();
  const contractAddress = searchParams.get('contract') || '';
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualHash, setManualHash] = useState(ipfsHash || '');
  const [certificateData, setCertificateData] = useState<any>(null);
  
  const verificationService = new CertificateVerificationService();

  useEffect(() => {
    if (ipfsHash) {
      handleVerification(ipfsHash);
    }
  }, [ipfsHash]);

  const handleVerification = async (hash: string) => {
    if (!hash.trim()) return;
    
    setLoading(true);
    setVerificationResult(null);
    setCertificateData(null);
    
    try {
      console.log('🔍 Starting certificate verification for:', hash);
      
      const result = await verificationService.verifyCertificate({
        ipfsHash: hash,
        contractAddress: contractAddress || '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B'
      });
      
      setVerificationResult(result);
      
      // Try to fetch certificate data if IPFS is accessible
      if (result.ipfsData?.exists) {
        try {
          const certData = await verificationService.getCertificateFromIPFS(hash);
          setCertificateData(certData);
        } catch (error) {
          console.warn('Could not fetch certificate data:', error);
        }
      }
      
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadReport = () => {
    if (!verificationResult || !ipfsHash) return;
    
    const report = verificationService.generateVerificationReport(verificationResult, ipfsHash);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-report-${ipfsHash}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of organ transplant certificates using IPFS hash
          </p>
        </div>

        {/* Manual Hash Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter an IPFS hash to verify a certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ipfs-hash">IPFS Hash</Label>
                <div className="flex gap-2">
                  <Input
                    id="ipfs-hash"
                    value={manualHash}
                    onChange={(e) => setManualHash(e.target.value)}
                    placeholder="Enter IPFS hash (e.g., QmXx... or bafy...)"
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleVerification(manualHash)}
                    disabled={loading || !manualHash.trim()}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Results */}
        {verificationResult && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge 
                    variant={verificationResult.isValid ? "default" : "destructive"}
                    className="text-lg px-4 py-2"
                  >
                    {verificationResult.isValid ? 'VALID CERTIFICATE' : 'INVALID CERTIFICATE'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={downloadReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>

                {verificationResult.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {verificationResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* IPFS Verification */}
            {verificationResult.ipfsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                    IPFS Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={verificationResult.ipfsData.exists ? "default" : "destructive"}>
                        {verificationResult.ipfsData.exists ? 'Accessible' : 'Not Accessible'}
                      </Badge>
                    </div>
                    
                    {verificationResult.ipfsData.url && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">URL:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {verificationResult.ipfsData.url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(verificationResult.ipfsData.url)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {verificationResult.ipfsData.contentType && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Content Type:</span>
                        <span>{verificationResult.ipfsData.contentType}</span>
                      </div>
                    )}
                    
                    {verificationResult.ipfsData.size && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Size:</span>
                        <span>{verificationResult.ipfsData.size} bytes</span>
                      </div>
                    )}
                    
                    {verificationResult.ipfsData.error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {verificationResult.ipfsData.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blockchain Verification */}
            {verificationResult.blockchainData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-purple-500" />
                    Blockchain Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={verificationResult.blockchainData.isValid ? "default" : "destructive"}>
                        {verificationResult.blockchainData.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    
                    {verificationResult.blockchainData.transactionHash && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Transaction Hash:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {verificationResult.blockchainData.transactionHash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(verificationResult.blockchainData.transactionHash)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {verificationResult.blockchainData.error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {verificationResult.blockchainData.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificate Data */}
            {certificateData && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Data</CardTitle>
                  <CardDescription>
                    Raw certificate data from IPFS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {typeof certificateData.data === 'string' 
                        ? certificateData.data.substring(0, 500) + '...'
                        : JSON.stringify(certificateData.data, null, 2)
                      }
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Verify a Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. <strong>Obtain the IPFS hash</strong> from the certificate or transaction details</p>
              <p>2. <strong>Enter the hash</strong> in the verification field above</p>
              <p>3. <strong>Click Verify</strong> to check the certificate authenticity</p>
              <p>4. <strong>Review the results</strong> to confirm the certificate is valid</p>
              <Separator className="my-4" />
              <p className="text-xs">
                <strong>Note:</strong> This verification system checks IPFS accessibility and blockchain data. 
                A valid certificate should be accessible via IPFS and have corresponding blockchain records.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateVerification;
