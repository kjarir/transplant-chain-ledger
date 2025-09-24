import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Clock, Activity, Plus, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OrganRequestForm from "@/components/forms/OrganRequestForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  doctor_notes?: string;
  blockchain_hash?: string;
}

const PatientDashboard = ({ profile }: { profile: Profile }) => {
  const [organRequests, setOrganRequests] = useState<OrganRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchOrganRequests();
  }, [profile.id]);

  const fetchOrganRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('organ_requests')
        .select('*')
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganRequests(data || []);
    } catch (error) {
      console.error('Error fetching organ requests:', error);
      toast({
        title: "Error",
        description: "Failed to load organ requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'matched': return 'bg-green-500';
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

  const stats = [
    {
      title: "Active Requests",
      value: organRequests.filter(r => !['transplanted', 'rejected'].includes(r.status)).length,
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Pending Approval",
      value: organRequests.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Matched Organs",
      value: organRequests.filter(r => r.status === 'matched').length,
      icon: Activity,
      color: "text-green-500"
    },
    {
      title: "Total Requests",
      value: organRequests.length,
      icon: Heart,
      color: "text-blue-500"
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
        <h2 className="text-2xl font-bold">Your Organ Requests</h2>
        <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
          <DialogTrigger asChild>
            <Button variant="medical">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Organ Request</DialogTitle>
              <DialogDescription>
                Fill out the form below to submit a new organ request. Your doctor will review and verify the information.
              </DialogDescription>
            </DialogHeader>
            <OrganRequestForm 
              patientId={profile.id} 
              onSuccess={() => {
                setShowRequestForm(false);
                fetchOrganRequests();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Organ Requests */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">Loading requests...</div>
        ) : organRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organ Requests</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any organ requests yet. Click the button above to create your first request.
              </p>
            </CardContent>
          </Card>
        ) : (
          organRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      {request.organ_type.charAt(0).toUpperCase() + request.organ_type.slice(1)} Request
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
                  <div>
                    <h4 className="font-medium mb-2">Medical Condition</h4>
                    <p className="text-sm text-muted-foreground">{request.medical_condition}</p>
                  </div>
                  
                  {request.doctor_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Doctor's Notes</h4>
                      <p className="text-sm text-muted-foreground">{request.doctor_notes}</p>
                    </div>
                  )}

                  {request.blockchain_hash && (
                    <div>
                      <h4 className="font-medium mb-2">Blockchain Verification</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-2 rounded">{request.blockchain_hash}</code>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Request ID: {request.id.slice(0, 8)}...
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

export default PatientDashboard;