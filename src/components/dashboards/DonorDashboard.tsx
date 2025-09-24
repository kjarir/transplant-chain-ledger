import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Shield, Activity, Plus, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OrganDonationForm from "@/components/forms/OrganDonationForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
}

interface OrganDonation {
  id: string;
  organ_type: string;
  status: string;
  medical_clearance: boolean;
  created_at: string;
  doctor_verified_by?: string;
  matched_request_id?: string;
  blockchain_hash?: string;
}

const DonorDashboard = ({ profile }: { profile: Profile }) => {
  const [donations, setDonations] = useState<OrganDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [profile.id]);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('organ_donations')
        .select('*')
        .eq('donor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast({
        title: "Error",
        description: "Failed to load donations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'verified': return 'bg-blue-500';
      case 'available': return 'bg-green-500';
      case 'allocated': return 'bg-purple-500';
      case 'completed': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = [
    {
      title: "Active Donations",
      value: donations.filter(d => !['completed'].includes(d.status)).length,
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Verified Organs",
      value: donations.filter(d => d.medical_clearance).length,
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Matched Donations",
      value: donations.filter(d => d.matched_request_id).length,
      icon: Activity,
      color: "text-blue-500"
    },
    {
      title: "Total Donations",
      value: donations.length,
      icon: Heart,
      color: "text-purple-500"
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

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Organ Donations</h2>
        <Dialog open={showDonationForm} onOpenChange={setShowDonationForm}>
          <DialogTrigger asChild>
            <Button variant="medical">
              <Plus className="w-4 h-4 mr-2" />
              Register Donation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register Organ Donation</DialogTitle>
              <DialogDescription>
                Register your intention to donate an organ. Medical verification will be required before the organ becomes available for matching.
              </DialogDescription>
            </DialogHeader>
            <OrganDonationForm 
              donorId={profile.id} 
              onSuccess={() => {
                setShowDonationForm(false);
                fetchDonations();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Donations */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">Loading donations...</div>
        ) : donations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organ Donations</h3>
              <p className="text-muted-foreground mb-4">
                You haven't registered any organ donations yet. Click the button above to register your first donation.
              </p>
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
                      {donation.organ_type.charAt(0).toUpperCase() + donation.organ_type.slice(1)} Donation
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
                      <h4 className="font-medium mb-2">Medical Clearance</h4>
                      <Badge variant="outline" className={donation.medical_clearance ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                        {donation.medical_clearance ? "Cleared" : "Pending"}
                      </Badge>
                    </div>
                    
                    {donation.matched_request_id && (
                      <div>
                        <h4 className="font-medium mb-2">Match Status</h4>
                        <Badge variant="outline" className="bg-blue-500 text-white">
                          Matched to Patient
                        </Badge>
                      </div>
                    )}
                  </div>

                  {donation.blockchain_hash && (
                    <div>
                      <h4 className="font-medium mb-2">Blockchain Verification</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-2 rounded">{donation.blockchain_hash}</code>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Donation ID: {donation.id.slice(0, 8)}...
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;