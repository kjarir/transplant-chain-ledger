import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransplantFlow from "@/components/TransplantFlow";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Users, Heart, Shield, CheckCircle, Clock, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
}

interface OrganRequest {
  id: string;
  organ_type: string;
  urgency_level: number;
  medical_condition: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone?: string;
    blood_type?: string;
  };
}

interface OrganDonation {
  id: string;
  organ_type: string;
  status: string;
  medical_clearance: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    phone?: string;
    blood_type?: string;
  };
}

const DoctorDashboard = ({ profile }: { profile: Profile }) => {
  const [requests, setRequests] = useState<OrganRequest[]>([]);
  const [donations, setDonations] = useState<OrganDonation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch organ requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('organ_requests')
        .select(`
          *,
          profiles!organ_requests_patient_id_fkey (
            full_name,
            phone,
            blood_type
          )
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch organ donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('organ_donations')
        .select(`
          *,
          profiles!organ_donations_donor_id_fkey (
            full_name,
            phone,
            blood_type
          )
        `)
        .order('created_at', { ascending: false });

      if (donationsError) throw donationsError;

      setRequests(requestsData || []);
      setDonations(donationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('organ_requests')
        .update({ 
          status: 'approved',
          doctor_notes: 'Approved by medical review'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "The organ request has been approved successfully."
      });
      
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const verifyDonation = async (donationId: string) => {
    try {
      const { error } = await supabase
        .from('organ_donations')
        .update({ 
          medical_clearance: true,
          status: 'verified',
          doctor_verified_by: profile.id
        })
        .eq('id', donationId);

      if (error) throw error;

      toast({
        title: "Donation Verified",
        description: "The organ donation has been medically verified."
      });
      
      fetchData();
    } catch (error) {
      console.error('Error verifying donation:', error);
      toast({
        title: "Error",
        description: "Failed to verify donation",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'verified': return 'bg-green-500';
      case 'matched': return 'bg-purple-500';
      case 'transplanted': return 'bg-emerald-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyText = (level: number) => {
    switch (level) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'Normal';
      case 4: return 'High';
      case 5: return 'Critical';
      default: return 'Normal';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pendingDonations = donations.filter(d => !d.medical_clearance && d.status === 'pending');

  const stats = [
    {
      title: "Pending Reviews",
      value: pendingRequests.length + pendingDonations.length,
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Total Patients",
      value: new Set(requests.map(r => r.profiles?.full_name).filter(Boolean)).size,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Total Donors",
      value: new Set(donations.map(d => d.profiles?.full_name).filter(Boolean)).size,
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Verified Donations",
      value: donations.filter(d => d.medical_clearance).length,
      icon: Shield,
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Patient Requests
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Donor Verifications
          </TabsTrigger>
          <TabsTrigger value="transplant" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Record Transplant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Patient Organ Requests</h2>
            <Badge variant="outline" className="bg-yellow-500 text-white">
              {pendingRequests.length} Pending Review
            </Badge>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Patient Requests</h3>
                  <p className="text-muted-foreground">No organ requests to review at this time.</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          {request.profiles?.full_name || 'Unknown Patient'} - {request.organ_type.charAt(0).toUpperCase() + request.organ_type.slice(1)}
                        </CardTitle>
                        <CardDescription>
                          Submitted on {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`${getStatusColor(request.status)} text-white border-0`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {getUrgencyText(request.urgency_level)} Priority
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-1">Contact</h4>
                          <p className="text-sm text-muted-foreground">{request.profiles?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Blood Type</h4>
                          <p className="text-sm text-muted-foreground">{request.profiles?.blood_type || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Medical Condition</h4>
                        <p className="text-sm text-muted-foreground">{request.medical_condition}</p>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button 
                            variant="medical" 
                            size="sm"
                            onClick={() => approveRequest(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Request
                          </Button>
                          <Button variant="outline" size="sm">
                            Request More Info
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Organ Donation Verifications</h2>
            <Badge variant="outline" className="bg-yellow-500 text-white">
              {pendingDonations.length} Pending Verification
            </Badge>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-8">Loading donations...</div>
            ) : donations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Donations to Verify</h3>
                  <p className="text-muted-foreground">No organ donations pending verification at this time.</p>
                </CardContent>
              </Card>
            ) : (
              donations.map((donation) => (
                <Card key={donation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          {donation.profiles?.full_name || 'Unknown Donor'} - {donation.organ_type.charAt(0).toUpperCase() + donation.organ_type.slice(1)}
                        </CardTitle>
                        <CardDescription>
                          Registered on {new Date(donation.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={`${getStatusColor(donation.status)} text-white border-0`}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </Badge>
                        {donation.medical_clearance && (
                          <Badge variant="outline" className="bg-green-500 text-white border-0">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-1">Contact</h4>
                          <p className="text-sm text-muted-foreground">{donation.profiles?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Blood Type</h4>
                          <p className="text-sm text-muted-foreground">{donation.profiles?.blood_type || 'Not specified'}</p>
                        </div>
                      </div>

                      {!donation.medical_clearance && donation.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button 
                            variant="medical" 
                            size="sm"
                            onClick={() => verifyDonation(donation.id)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Verify Donation
                          </Button>
                          <Button variant="outline" size="sm">
                            Schedule Evaluation
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="transplant" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Record Transplant Transaction</h2>
            <Badge variant="outline" className="bg-green-500 text-white">
              Blockchain + IPFS
            </Badge>
          </div>
          <TransplantFlow />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;