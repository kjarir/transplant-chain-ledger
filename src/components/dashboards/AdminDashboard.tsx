import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Heart, Activity, TrendingUp, AlertTriangle, CheckCircle, Eye, BookOpen, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BlogManagement from "@/components/BlogManagement";
import { DatabaseInitializer } from "@/services/DatabaseInitializer";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
}

interface Transaction {
  id: string;
  transaction_hash: string;
  transaction_type: string;
  status: string;
  created_at: string;
  blockchain_data?: any;
}

interface SystemStats {
  totalUsers: number;
  totalRequests: number;
  totalDonations: number;
  totalTransactions: number;
  pendingRequests: number;
  verifiedDonations: number;
  successfulMatches: number;
}

const AdminDashboard = ({ profile }: { profile: Profile }) => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalRequests: 0,
    totalDonations: 0,
    totalTransactions: 0,
    pendingRequests: 0,
    verifiedDonations: 0,
    successfulMatches: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch system statistics
      const [
        { count: usersCount },
        { count: requestsCount },
        { count: donationsCount },
        { count: transactionsCount },
        { count: pendingCount },
        { count: verifiedCount },
        { count: matchesCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('organ_requests').select('*', { count: 'exact', head: true }),
        supabase.from('organ_donations').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('organ_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('organ_donations').select('*', { count: 'exact', head: true }).eq('medical_clearance', true),
        supabase.from('organ_requests').select('*', { count: 'exact', head: true }).eq('status', 'matched')
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalRequests: requestsCount || 0,
        totalDonations: donationsCount || 0,
        totalTransactions: transactionsCount || 0,
        pendingRequests: pendingCount || 0,
        verifiedDonations: verifiedCount || 0,
        successfulMatches: matchesCount || 0
      });

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBlockchainCertificate = async (requestId: string) => {
    try {
      // Simulate blockchain transaction creation
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      const { error } = await supabase.from('transactions').insert({
        transaction_hash: transactionHash,
        transaction_type: 'certification',
        status: 'completed',
        blockchain_data: {
          certificateType: 'organ_allocation',
          timestamp: new Date().toISOString(),
          verified: true
        }
      });

      if (error) throw error;

      toast({
        title: "Certificate Generated",
        description: "Blockchain certificate has been created successfully."
      });

      fetchAdminData();
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to generate blockchain certificate",
        variant: "destructive"
      });
    }
  };

  const initializeLiveTracking = async () => {
    try {
      const success = await DatabaseInitializer.initializeDatabase();
      if (success) {
        toast({
          title: "Database Initialized",
          description: "Live organ tracking database has been set up successfully."
        });
      } else {
        throw new Error('Database initialization failed');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize live tracking database",
        variant: "destructive"
      });
    }
  };

  const addSampleData = async () => {
    try {
      const success = await DatabaseInitializer.addSampleOrgans();
      if (success) {
        toast({
          title: "Sample Data Added",
          description: "Sample organs have been added to the live tracking system."
        });
      } else {
        throw new Error('Sample data addition failed');
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast({
        title: "Sample Data Failed",
        description: "Failed to add sample organs",
        variant: "destructive"
      });
    }
  };

  const systemMetrics = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      change: "+12% this month"
    },
    {
      title: "Organ Requests",
      value: stats.totalRequests,
      icon: Heart,
      color: "text-red-500",
      change: "+8% this month"
    },
    {
      title: "Organ Donations",
      value: stats.totalDonations,
      icon: Shield,
      color: "text-green-500",
      change: "+15% this month"
    },
    {
      title: "Blockchain Transactions",
      value: stats.totalTransactions,
      icon: Activity,
      color: "text-purple-500",
      change: "+22% this month"
    }
  ];

  const operationalMetrics = [
    {
      title: "Pending Reviews",
      value: stats.pendingRequests,
      icon: AlertTriangle,
      color: "text-yellow-500",
      status: "warning"
    },
    {
      title: "Verified Donations",
      value: stats.verifiedDonations,
      icon: CheckCircle,
      color: "text-green-500",
      status: "success"
    },
    {
      title: "Successful Matches",
      value: stats.successfulMatches,
      icon: Heart,
      color: "text-blue-500",
      status: "info"
    },
    {
      title: "System Uptime",
      value: "99.9%",
      icon: TrendingUp,
      color: "text-emerald-500",
      status: "success"
    }
  ];

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-6">System Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {systemMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                  <Badge variant="outline" className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Operational Metrics</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {operationalMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                  </div>
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Management */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="transactions">Blockchain</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-1">
            <Database className="w-4 h-4" />
            <span>Database</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Blockchain Transactions</h2>
            <Badge variant="outline" className="bg-purple-500 text-white">
              {transactions.length} Recent
            </Badge>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                  <p className="text-muted-foreground">No blockchain transactions recorded yet.</p>
                </CardContent>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-500" />
                          {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(transaction.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-500 text-white border-0">
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Transaction Hash</h4>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted p-2 rounded flex-1">
                            {transaction.transaction_hash}
                          </code>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>

                      {transaction.blockchain_data && (
                        <div>
                          <h4 className="font-medium mb-2">Blockchain Data</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(transaction.blockchain_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>
                Complete audit log of all system activities and administrative actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Audit trail functionality will be implemented in the next version.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Certificate Management</h2>
            <Button 
              variant="medical"
              onClick={() => generateBlockchainCertificate('sample')}
            >
              Generate Test Certificate
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Certificates</CardTitle>
              <CardDescription>
                Generate and manage tamper-proof certificates for organ allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Certificate management interface will be available after matching system is implemented.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <BlogManagement />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Database Management</h2>
            <Badge variant="outline" className="bg-blue-500 text-white">
              Live Tracking Setup
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Initialize Database</span>
                </CardTitle>
                <CardDescription>
                  Set up the live organ tracking database with medical centers and tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will create the necessary tables and medical centers for live organ tracking.
                  </p>
                  <Button onClick={initializeLiveTracking} className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Initialize Database
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Add Sample Data</span>
                </CardTitle>
                <CardDescription>
                  Add sample organs to test the live tracking system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will add sample organs to demonstrate the live tracking functionality.
                  </p>
                  <Button onClick={addSampleData} variant="outline" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Add Sample Organs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Tracking Features</CardTitle>
              <CardDescription>
                Once initialized, the system will support:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Real-time Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Live organ availability tracking</li>
                    <li>• Real-time map updates</li>
                    <li>• Automatic status changes</li>
                    <li>• Location-based organ matching</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Database Tables:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• live_organ_availability</li>
                    <li>• medical_centers</li>
                    <li>• organ_transplant_logs</li>
                    <li>• Real-time subscriptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;