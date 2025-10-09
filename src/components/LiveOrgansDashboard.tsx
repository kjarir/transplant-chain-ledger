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
import { LiveOrganTrackingService, LiveOrgan, OrganTransplantLog } from "@/services/LiveOrganTrackingService";

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

  useEffect(() => {
    loadLiveData();
    
    // Subscribe to real-time updates
    const unsubscribe = LiveOrganTrackingService.subscribeToLiveUpdates(
      'dashboard',
      (organs) => {
        setLiveOrgans(organs);
        generateLiveUpdates(organs);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      const organs = await LiveOrganTrackingService.getLiveOrgans();
      setLiveOrgans(organs);
      generateLiveUpdates(organs);
    } catch (error) {
      console.error('Error loading live data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLiveUpdates = (organs: LiveOrgan[]) => {
    const updates: LiveUpdate[] = [];
    
    // Generate updates based on recent organ activities
    organs.slice(0, 10).forEach(organ => {
      const timeAgo = getTimeAgo(organ.updated_at);
      let message = '';
      let type: LiveUpdate['type'] = 'donation';
      let priority: LiveUpdate['priority'] = 'medium';

      switch (organ.status) {
        case 'available':
          message = `${organ.organ_label} donation available at ${organ.location_name}`;
          type = 'donation';
          priority = organ.urgency === 'critical' ? 'high' : 'medium';
          break;
        case 'matched':
          message = `${organ.organ_label} matched with recipient at ${organ.location_name}`;
          type = 'match';
          priority = 'high';
          break;
        case 'in_transit':
          message = `${organ.organ_label} in transit to ${organ.recipient_location}`;
          type = 'transplant';
          priority = 'high';
          break;
        case 'transplanted':
          message = `${organ.organ_label} transplant completed successfully`;
          type = 'transplant';
          priority = 'high';
          break;
      }

      if (message) {
        updates.push({
          id: organ.id,
          type,
          message,
          timestamp: timeAgo,
          priority
        });
      }
    });

    setLiveUpdates(updates.slice(0, 5)); // Show only 5 most recent
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    loadLiveData();
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
            {liveOrgans.map((organ) => {
              const getOrganIcon = (organType: string) => {
                switch (organType) {
                  case 'heart': return Heart;
                  case 'liver': return Activity;
                  case 'kidney': return Users;
                  case 'lung': return TrendingUp;
                  case 'pancreas': return Zap;
                  default: return Activity;
                }
              };

              const getOrganColor = (organType: string) => {
                switch (organType) {
                  case 'heart': return 'text-red-500';
                  case 'liver': return 'text-orange-500';
                  case 'kidney': return 'text-blue-500';
                  case 'lung': return 'text-purple-500';
                  case 'pancreas': return 'text-green-500';
                  default: return 'text-gray-500';
                }
              };

              const OrganIcon = getOrganIcon(organ.organ_type);
              const organColor = getOrganColor(organ.organ_type);

              return (
                <Card key={organ.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <OrganIcon className={`w-5 h-5 ${organColor}`} />
                        <CardTitle className="text-lg">{organ.organ_label}</CardTitle>
                      </div>
                      {getStatusBadge(organ.status)}
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{organ.location_name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Blood Type:</span>
                        <div className="font-medium">{organ.blood_type || 'Not specified'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <div className="font-medium">{organ.organ_age ? `${organ.organ_age} years` : 'Not specified'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <div className="font-medium">{organ.organ_size || 'Not specified'}</div>
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
                        {organ.time_remaining ? `${organ.time_remaining}h` : 'N/A'}
                      </Badge>
                    </div>

                    {organ.recipient_name && (
                      <div className="pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-gray-500">Recipient:</span>
                          <div className="font-medium">{organ.recipient_name}</div>
                          <div className="text-xs text-gray-500">{organ.recipient_location}</div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Updated: {getTimeAgo(organ.updated_at)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
