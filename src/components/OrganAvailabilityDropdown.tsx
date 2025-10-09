import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";

interface OrganAvailability {
  organType: string;
  label: string;
  icon: React.ComponentType<any>;
  availableCount: number;
  criticalCount: number;
  waitTime: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  locations: string[];
  lastUpdated: string;
  color: string;
}

const OrganAvailabilityDropdown = ({ 
  onOrganSelect, 
  showDetails = false,
  className = "" 
}: {
  onOrganSelect?: (organType: string) => void;
  showDetails?: boolean;
  className?: string;
}) => {
  const [selectedOrgan, setSelectedOrgan] = useState<string>("");
  const [organData, setOrganData] = useState<OrganAvailability[]>([]);

  // Mock data - in real app, this would come from your blockchain/backend
  useEffect(() => {
    const mockOrganData: OrganAvailability[] = [
      {
        organType: 'heart',
        label: 'Heart',
        icon: Heart,
        availableCount: 3,
        criticalCount: 3,
        waitTime: '2-4 weeks',
        priority: 'critical',
        locations: ['New York', 'California', 'Texas'],
        lastUpdated: '2 minutes ago',
        color: 'text-red-500'
      },
      {
        organType: 'liver',
        label: 'Liver',
        icon: Activity,
        availableCount: 5,
        criticalCount: 2,
        waitTime: '1-3 weeks',
        priority: 'critical',
        locations: ['Florida', 'Illinois', 'Washington'],
        lastUpdated: '5 minutes ago',
        color: 'text-orange-500'
      },
      {
        organType: 'kidney',
        label: 'Kidney',
        icon: Users,
        availableCount: 12,
        criticalCount: 4,
        waitTime: '3-6 months',
        priority: 'high',
        locations: ['Ohio', 'Pennsylvania', 'Michigan', 'Georgia'],
        lastUpdated: '1 minute ago',
        color: 'text-blue-500'
      },
      {
        organType: 'lung',
        label: 'Lung',
        icon: TrendingUp,
        availableCount: 2,
        criticalCount: 2,
        waitTime: '1-2 months',
        priority: 'critical',
        locations: ['Colorado', 'Arizona'],
        lastUpdated: '3 minutes ago',
        color: 'text-purple-500'
      },
      {
        organType: 'pancreas',
        label: 'Pancreas',
        icon: Zap,
        availableCount: 1,
        criticalCount: 0,
        waitTime: '2-4 months',
        priority: 'high',
        locations: ['Massachusetts'],
        lastUpdated: '10 minutes ago',
        color: 'text-green-500'
      },
      {
        organType: 'cornea',
        label: 'Cornea',
        icon: Activity,
        availableCount: 25,
        criticalCount: 5,
        waitTime: '1-2 weeks',
        priority: 'medium',
        locations: ['Multiple locations'],
        lastUpdated: '30 seconds ago',
        color: 'text-indigo-500'
      },
      {
        organType: 'bone',
        label: 'Bone/Tissue',
        icon: Users,
        availableCount: 40,
        criticalCount: 8,
        waitTime: '1-4 weeks',
        priority: 'low',
        locations: ['Multiple locations'],
        lastUpdated: '1 minute ago',
        color: 'text-gray-500'
      },
      {
        organType: 'skin',
        label: 'Skin',
        icon: Activity,
        availableCount: 15,
        criticalCount: 3,
        waitTime: '1-3 weeks',
        priority: 'medium',
        locations: ['Multiple locations'],
        lastUpdated: '2 minutes ago',
        color: 'text-pink-500'
      }
    ];

    // Sort by priority (critical first, then by available count)
    const sortedData = mockOrganData.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.availableCount - a.availableCount;
    });

    setOrganData(sortedData);
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
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

  const handleOrganSelect = (value: string) => {
    setSelectedOrgan(value);
    onOrganSelect?.(value);
  };

  const selectedOrganData = organData.find(organ => organ.organType === selectedOrgan);

  if (!showDetails) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Select value={selectedOrgan} onValueChange={handleOrganSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select organ type with availability" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {organData.map((organ) => (
              <SelectItem key={organ.organType} value={organ.organType}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <organ.icon className={`w-4 h-4 ${organ.color}`} />
                    <span>{organ.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getPriorityBadge(organ.priority)}
                    <Badge variant="outline" className="text-xs">
                      {organ.availableCount} available
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Select value={selectedOrgan} onValueChange={handleOrganSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select organ type to view details" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {organData.map((organ) => (
            <SelectItem key={organ.organType} value={organ.organType}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <organ.icon className={`w-4 h-4 ${organ.color}`} />
                  <span>{organ.label}</span>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {getPriorityBadge(organ.priority)}
                  <Badge variant="outline" className="text-xs">
                    {organ.availableCount} available
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOrganData && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <selectedOrganData.icon className={`w-5 h-5 ${selectedOrganData.color}`} />
                <span>{selectedOrganData.label} Availability</span>
              </CardTitle>
              {getPriorityBadge(selectedOrganData.priority)}
            </div>
            <CardDescription>
              Last updated {selectedOrganData.lastUpdated}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Available</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedOrganData.availableCount}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Critical Need</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {selectedOrganData.criticalCount}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Average Wait Time:</span>
                <Badge variant="outline">{selectedOrganData.waitTime}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Available Locations:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOrganData.locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View on Map
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganAvailabilityDropdown;
