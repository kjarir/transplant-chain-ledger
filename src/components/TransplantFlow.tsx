import React, { useState, useEffect } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useAuth } from '@/contexts/AuthContext';
import TransplantFlowService, { TransplantFlowInput, TransplantFlowResult } from '@/services/TransplantFlowService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  CheckCircle, 
  ExternalLink, 
  Download, 
  Printer, 
  Loader2,
  FileText,
  Cloud,
  Link
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TransplantFlow: React.FC = () => {
  const { contract, signer, isConnected } = useBlockchain();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransplantFlowResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TransplantFlowInput>({
    requestId: 1,
    donationId: 1,
    patientEmail: '',
    donorEmail: '',
    organType: 'kidney',
    transplantDate: new Date().toISOString().split('T')[0],
    hospitalName: '',
    doctorNotes: '',
    patientName: '',
    donorName: '',
    doctorName: ''
  });

  // Update doctor name when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setFormData(prev => ({ ...prev, doctorName: profile.full_name }));
    }
  }, [profile?.full_name]);

  const transplantService = new TransplantFlowService();

  const testPinataConnection = async () => {
    try {
      const pinataService = new (await import('@/services/PinataService')).default();
      const result = await pinataService.testAuthentication();
      if (result) {
        alert('✅ Pinata connection successful!');
      } else {
        alert('❌ Pinata connection failed!');
      }
    } catch (error) {
      console.error('Pinata test error:', error);
      alert('❌ Pinata test error: ' + (error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !contract || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to record transactions on the blockchain.",
        variant: "destructive"
      });
      return;
    }

    if (profile?.role !== 'doctor' && profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only doctors and admins can record transplant transactions.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Initialize the transplant service
      transplantService.initialize(contract, signer);

      // Complete the transplant flow
      const flowResult = await transplantService.completeTransplantFlow(formData);

      setResult(flowResult);

      toast({
        title: "Transplant Recorded Successfully!",
        description: `Transaction recorded on blockchain and certificate uploaded to IPFS.`,
      });

    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Transplant Flow Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (result) {
      transplantService.downloadCertificate(result.certificateHTML, result.certificateData.certificateNumber);
    }
  };

  const handlePrintCertificate = () => {
    if (result) {
      transplantService.printCertificate(result.certificateHTML);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Transplant Flow
          </CardTitle>
          <CardDescription>
            Record transplant transactions on the blockchain and generate certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please connect your wallet to access the transplant flow functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (profile?.role !== 'doctor' && profile?.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Transplant Flow
          </CardTitle>
          <CardDescription>
            Record transplant transactions on the blockchain and generate certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Only doctors and administrators can record transplant transactions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Complete Transplant Flow
          </CardTitle>
          <CardDescription>
            Record transaction on blockchain → Generate certificate → Upload to IPFS
          </CardDescription>
          <div className="flex gap-2 mt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={testPinataConnection}
            >
              Test Pinata Connection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestId">Request ID</Label>
                <Input
                  id="requestId"
                  type="number"
                  value={formData.requestId}
                  onChange={(e) => setFormData({ ...formData, requestId: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donationId">Donation ID</Label>
                <Input
                  id="donationId"
                  type="number"
                  value={formData.donationId}
                  onChange={(e) => setFormData({ ...formData, donationId: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Patient Email</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                  placeholder="patient@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donorEmail">Donor Email</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                  placeholder="donor@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organType">Organ Type</Label>
                <Select value={formData.organType} onValueChange={(value) => setFormData({ ...formData, organType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organ type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="kidney">Kidney</SelectItem>
                    <SelectItem value="liver">Liver</SelectItem>
                    <SelectItem value="lung">Lung</SelectItem>
                    <SelectItem value="pancreas">Pancreas</SelectItem>
                    <SelectItem value="cornea">Cornea</SelectItem>
                    <SelectItem value="bone">Bone</SelectItem>
                    <SelectItem value="skin">Skin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transplantDate">Transplant Date</Label>
                <Input
                  id="transplantDate"
                  type="date"
                  value={formData.transplantDate}
                  onChange={(e) => setFormData({ ...formData, transplantDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                placeholder="Enter hospital name"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donorName">Donor Name</Label>
                <Input
                  id="donorName"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  placeholder="Enter donor name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorNotes">Doctor Notes</Label>
              <Input
                id="doctorNotes"
                value={formData.doctorNotes}
                onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                placeholder="Enter medical notes"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording Transaction...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Complete Transplant Flow
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Transplant Successfully Recorded!
            </CardTitle>
            <CardDescription>
              Transaction recorded on blockchain and certificate uploaded to IPFS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Transaction Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Hash:</span> {result.transaction.txHash}</p>
                  <p><span className="font-medium">Block:</span> {result.transaction.blockNumber}</p>
                  <p><span className="font-medium">Organ:</span> {result.transaction.organType}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Certificate Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Number:</span> {result.certificateData.certificateNumber}</p>
                  <p><span className="font-medium">Date:</span> {result.certificateData.transplantDate}</p>
                  <p><span className="font-medium">Hospital:</span> {result.certificateData.hospitalName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">IPFS Links</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(result.certificateUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(result.metadataUrl, '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Metadata
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCertificate}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintCertificate}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">IPFS Hashes</h4>
              <div className="space-y-1 text-xs font-mono bg-gray-100 p-2 rounded">
                <p><span className="font-medium">Certificate:</span> {result.ipfsResults.certificate.hash}</p>
                <p><span className="font-medium">Metadata:</span> {result.ipfsResults.metadata.hash}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransplantFlow;
