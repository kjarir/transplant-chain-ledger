import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PatientDashboard from "@/components/dashboards/PatientDashboard";
import DonorDashboard from "@/components/dashboards/DonorDashboard";
import DoctorDashboard from "@/components/dashboards/DoctorDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import WalletConnection from "@/components/WalletConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-4 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-blue-500';
      case 'donor': return 'bg-green-500';
      case 'doctor': return 'bg-purple-500';
      case 'admin': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderDashboard = () => {
    switch (profile.role) {
      case 'patient':
        return <PatientDashboard profile={profile} />;
      case 'donor':
        return <DonorDashboard profile={profile} />;
      case 'doctor':
        return <DoctorDashboard profile={profile} />;
      case 'admin':
        return <AdminDashboard profile={profile} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Welcome back, {profile.full_name}</h1>
              <Badge variant="outline" className={`${getRoleColor(profile.role)} text-white border-0`}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Manage your TransplantChain account and {profile.role} activities
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-medium">{profile.blood_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant="outline" className="bg-green-500 text-white border-0">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnection />
        </div>

        {/* Role-specific Dashboard */}
        {renderDashboard()}
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;