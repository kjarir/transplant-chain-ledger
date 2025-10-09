import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Heart, 
  Users, 
  TrendingUp, 
  Zap,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  Bell,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import OrganAvailabilityMap from "./OrganAvailabilityMap";

interface LiveOrgan {
  id: string;
  organType: string;
  organLabel: string;
  status: 'available' | 'in_transit' | 'matched' | 'transplanted';
  location: string;
  bloodType: string;
  age: number;
  size: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  timeRemaining: string;
  recipient?: {
    name: string;
    location: string;
    urgency: string;
  };
  lastUpdated: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface LiveUpdate {
  id: string;
  type: 'donation' | 'request' | 'match' | 'transplant';
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

const LiveOrgansDashboard = () => {
  const [liveOrgans, setLiveOrgans] = useState<LiveOrgan[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data - in real app, this would come from your blockchain/backend
  useEffect(() => {
    const mockLiveOrgans: LiveOrgan[] = [
      {
        id: '1',
        organType: 'heart',
        organLabel: 'Heart',
        status: 'available',
        location: 'New York Medical Center',
        bloodType: 'O+',
        age: 25,
        size: 'Medium',
        urgency: 'critical',
        timeRemaining: '4 hours',
        lastUpdated: '2 minutes ago',
        icon: Heart,
        color: 'text-red-500'
      },
      {
        id: '2',
        organType: 'liver',
        organLabel: 'Liver',
        status: 'in_transit',
        location: 'En route to California',
        bloodType: 'A+',
        age: 32,
        size: 'Large',
        urgency: 'critical',
        timeRemaining: '6 hours',
        recipient: {
          name: 'John Smith',
          location: 'California Transplant Institute',
          urgency: 'Critical'
        },
        lastUpdated: '1 minute ago',
        icon: Activity,
        color: 'text-orange-500'
      },
      {
        id: '3',
        organType: 'kidney',
        organLabel: 'Kidney',
        status: 'matched',
        location: 'Ohio Kidney Institute',
        bloodType: 'B+',
        age: 28,
        size: 'Medium',
        urgency: 'high',
        timeRemaining: '12 hours',
        recipient: {
          name: 'Sarah Johnson',
          location: 'Pennsylvania Transplant Center',
          urgency: 'High'
        },
        lastUpdated: '3 minutes ago',
        icon: Users,
        color: 'text-blue-500'
      },
      {
        id: '4',
        organType: 'lung',
        organLabel: 'Lung',
        status: 'transplanted',
        location: 'Colorado Lung Center',
        bloodType: 'AB+',
        age: 35,
        size: 'Large',
        urgency: 'critical',
        timeRemaining: 'Completed',
        recipient: {
          name: 'Michael Chen',
          location: 'Colorado Lung Center',
          urgency: 'Critical'
        },
        lastUpdated: '30 minutes ago',
        icon: TrendingUp,
        color: 'text-purple-500'
      },
      {
        id: '5',
        organType: 'pancreas',
        organLabel: 'Pancreas',
        status: 'available',
        location: 'Massachusetts Pancreas Center',
        bloodType: 'O-',
        age: 29,
        size: 'Medium',
        urgency: 'high',
        timeRemaining: '8 hours',
        lastUpdated: '5 minutes ago',
        icon: Zap,
        color: 'text-green-500'
      }
    ];

    const mockLiveUpdates: LiveUpdate[] = [
      {
        id: '1',
        type: 'transplant',
        message: 'Heart transplant completed successfully at New York Medical Center',
        timestamp: '2 minutes ago',
        priority: 'high'
      },
      {
        id: '2',
        type: 'match',
        message: 'New kidney match found for patient in Pennsylvania',
        timestamp: '5 minutes ago',
        priority: 'high'
      },
      {
        id: '3',
        type: 'donation',
        message: 'Liver donation registered from California donor',
        timestamp: '8 minutes ago',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'request',
        message: 'Critical heart request submitted from Texas',
        timestamp: '12 minutes ago',
        priority: 'high'
      },
      {
        id: '5',
        type: 'transplant',
        message: 'Lung transplant procedure started in Colorado',
        timestamp: '15 minutes ago',
        priority: 'medium'
      }
    ];

    setLiveOrgans(mockLiveOrgans);
    setLiveUpdates(mockLiveUpdates);
    setLoading(false);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setLastRefresh(new Date());
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>;
      case 'in_transit':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case 'matched':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Matched</Badge>;
      case 'transplanted':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Transplanted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'transplant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'match':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'donation':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'request':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUpdatePriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Live Organs Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Real-time organ availability and transplant status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {liveOrgans.filter(organ => organ.status === 'available').length}
                </div>
                <div className="text-sm opacity-90">Available Now</div>
              </div>
              <Heart className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {liveOrgans.filter(organ => organ.status === 'in_transit').length}
                </div>
                <div className="text-sm opacity-90">In Transit</div>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {liveOrgans.filter(organ => organ.status === 'matched').length}
                </div>
                <div className="text-sm opacity-90">Matched</div>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {liveOrgans.filter(organ => organ.status === 'transplanted').length}
                </div>
                <div className="text-sm opacity-90">Transplanted</div>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="organs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organs">Live Organs</TabsTrigger>
          <TabsTrigger value="updates">Live Updates</TabsTrigger>
          <TabsTrigger value="map">Location Map</TabsTrigger>
        </TabsList>

        <TabsContent value="organs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveOrgans.map((organ) => (
              <Card key={organ.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <organ.icon className={`w-5 h-5 ${organ.color}`} />
                      <CardTitle className="text-lg">{organ.organLabel}</CardTitle>
                    </div>
                    {getStatusBadge(organ.status)}
                  </div>
                  <CardDescription className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{organ.location}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Blood Type:</span>
                      <div className="font-medium">{organ.bloodType}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Age:</span>
                      <div className="font-medium">{organ.age} years</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <div className="font-medium">{organ.size}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Urgency:</span>
                      <div>{getUrgencyBadge(organ.urgency)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Time Remaining:</span>
                    </div>
                    <Badge variant="outline" className={organ.status === 'transplanted' ? 'text-green-600' : ''}>
                      {organ.timeRemaining}
                    </Badge>
                  </div>

                  {organ.recipient && (
                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <span className="text-gray-500">Recipient:</span>
                        <div className="font-medium">{organ.recipient.name}</div>
                        <div className="text-xs text-gray-500">{organ.recipient.location}</div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Updated: {organ.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <div className="space-y-3">
            {liveUpdates.map((update) => (
              <Card key={update.id} className={`border-l-4 ${getUpdatePriorityColor(update.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{update.timestamp}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {update.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <OrganAvailabilityMap />
        </TabsContent>
      </Tabs>

      {/* Critical Alerts */}
      <Card className="border-l-4 border-l-red-500 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Critical Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium">3 Critical Heart Requests</p>
                  <p className="text-sm text-gray-600">Patients in life-threatening condition</p>
                </div>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">2 Lung Transplants Needed</p>
                  <p className="text-sm text-gray-600">Time-sensitive matches required</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveOrgansDashboard;
