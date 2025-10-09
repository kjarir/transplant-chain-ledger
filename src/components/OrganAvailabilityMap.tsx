import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Heart, 
  Activity, 
  Users, 
  TrendingUp, 
  Zap,
  RefreshCw,
  Filter,
  Layers
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OrganLocation {
  id: string;
  name: string;
  organType: string;
  organLabel: string;
  position: [number, number];
  availableCount: number;
  criticalCount: number;
  lastUpdated: string;
  contact: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// Custom icon component for map markers
const createCustomIcon = (color: string, organType: string) => {
  const iconSvg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="8"/>
      <text x="12.5" y="17" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">${organType.charAt(0).toUpperCase()}</text>
    </svg>
  `;
  
  return L.divIcon({
    html: iconSvg,
    className: 'custom-div-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41]
  });
};

const MapController = ({ selectedOrgan, organLocations }: { selectedOrgan: string; organLocations: OrganLocation[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedOrgan && selectedOrgan !== 'all') {
      const filteredLocations = organLocations.filter(loc => loc.organType === selectedOrgan);
      if (filteredLocations.length > 0) {
        const bounds = L.latLngBounds(filteredLocations.map(loc => loc.position));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else {
      const bounds = L.latLngBounds(organLocations.map(loc => loc.position));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [selectedOrgan, organLocations, map]);

  return null;
};

const OrganAvailabilityMap = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string>('all');
  const [organLocations, setOrganLocations] = useState<OrganLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  // Mock data - in real app, this would come from your blockchain/backend
  useEffect(() => {
    const mockLocations: OrganLocation[] = [
      {
        id: '1',
        name: 'New York Medical Center',
        organType: 'heart',
        organLabel: 'Heart',
        position: [40.7128, -74.0060],
        availableCount: 2,
        criticalCount: 2,
        lastUpdated: '2 minutes ago',
        contact: '+1 (555) 123-4567',
        icon: Heart,
        color: '#ef4444',
        priority: 'critical'
      },
      {
        id: '2',
        name: 'California Transplant Institute',
        organType: 'heart',
        organLabel: 'Heart',
        position: [34.0522, -118.2437],
        availableCount: 1,
        criticalCount: 1,
        lastUpdated: '5 minutes ago',
        contact: '+1 (555) 234-5678',
        icon: Heart,
        color: '#ef4444',
        priority: 'critical'
      },
      {
        id: '3',
        name: 'Texas Heart Center',
        organType: 'heart',
        organLabel: 'Heart',
        position: [29.7604, -95.3698],
        availableCount: 1,
        criticalCount: 1,
        lastUpdated: '3 minutes ago',
        contact: '+1 (555) 345-6789',
        icon: Heart,
        color: '#ef4444',
        priority: 'critical'
      },
      {
        id: '4',
        name: 'Florida Liver Institute',
        organType: 'liver',
        organLabel: 'Liver',
        position: [25.7617, -80.1918],
        availableCount: 2,
        criticalCount: 1,
        lastUpdated: '4 minutes ago',
        contact: '+1 (555) 456-7890',
        icon: Activity,
        color: '#f97316',
        priority: 'critical'
      },
      {
        id: '5',
        name: 'Illinois Organ Center',
        organType: 'liver',
        organLabel: 'Liver',
        position: [41.8781, -87.6298],
        availableCount: 2,
        criticalCount: 1,
        lastUpdated: '6 minutes ago',
        contact: '+1 (555) 567-8901',
        icon: Activity,
        color: '#f97316',
        priority: 'critical'
      },
      {
        id: '6',
        name: 'Washington Kidney Center',
        organType: 'liver',
        organLabel: 'Liver',
        position: [47.6062, -122.3321],
        availableCount: 1,
        criticalCount: 0,
        lastUpdated: '8 minutes ago',
        contact: '+1 (555) 678-9012',
        icon: Activity,
        color: '#f97316',
        priority: 'high'
      },
      {
        id: '7',
        name: 'Ohio Kidney Institute',
        organType: 'kidney',
        organLabel: 'Kidney',
        position: [39.9612, -82.9988],
        availableCount: 4,
        criticalCount: 2,
        lastUpdated: '1 minute ago',
        contact: '+1 (555) 789-0123',
        icon: Users,
        color: '#3b82f6',
        priority: 'high'
      },
      {
        id: '8',
        name: 'Pennsylvania Transplant Center',
        organType: 'kidney',
        organLabel: 'Kidney',
        position: [39.9526, -75.1652],
        availableCount: 3,
        criticalCount: 1,
        lastUpdated: '2 minutes ago',
        contact: '+1 (555) 890-1234',
        icon: Users,
        color: '#3b82f6',
        priority: 'high'
      },
      {
        id: '9',
        name: 'Michigan Medical Center',
        organType: 'kidney',
        organLabel: 'Kidney',
        position: [42.3314, -83.0458],
        availableCount: 3,
        criticalCount: 1,
        lastUpdated: '3 minutes ago',
        contact: '+1 (555) 901-2345',
        icon: Users,
        color: '#3b82f6',
        priority: 'high'
      },
      {
        id: '10',
        name: 'Georgia Organ Bank',
        organType: 'kidney',
        organLabel: 'Kidney',
        position: [33.7490, -84.3880],
        availableCount: 2,
        criticalCount: 0,
        lastUpdated: '4 minutes ago',
        contact: '+1 (555) 012-3456',
        icon: Users,
        color: '#3b82f6',
        priority: 'medium'
      },
      {
        id: '11',
        name: 'Colorado Lung Center',
        organType: 'lung',
        organLabel: 'Lung',
        position: [39.7392, -104.9903],
        availableCount: 1,
        criticalCount: 1,
        lastUpdated: '5 minutes ago',
        contact: '+1 (555) 123-4567',
        icon: TrendingUp,
        color: '#8b5cf6',
        priority: 'critical'
      },
      {
        id: '12',
        name: 'Arizona Pulmonary Institute',
        organType: 'lung',
        organLabel: 'Lung',
        position: [33.4484, -112.0740],
        availableCount: 1,
        criticalCount: 1,
        lastUpdated: '7 minutes ago',
        contact: '+1 (555) 234-5678',
        icon: TrendingUp,
        color: '#8b5cf6',
        priority: 'critical'
      },
      {
        id: '13',
        name: 'Massachusetts Pancreas Center',
        organType: 'pancreas',
        organLabel: 'Pancreas',
        position: [42.3601, -71.0589],
        availableCount: 1,
        criticalCount: 0,
        lastUpdated: '10 minutes ago',
        contact: '+1 (555) 345-6789',
        icon: Zap,
        color: '#10b981',
        priority: 'high'
      }
    ];

    setOrganLocations(mockLocations);
    setLoading(false);
  }, []);

  const organTypes = [
    { value: 'all', label: 'All Organs' },
    { value: 'heart', label: 'Heart' },
    { value: 'liver', label: 'Liver' },
    { value: 'kidney', label: 'Kidney' },
    { value: 'lung', label: 'Lung' },
    { value: 'pancreas', label: 'Pancreas' },
    { value: 'cornea', label: 'Cornea' },
    { value: 'bone', label: 'Bone/Tissue' },
    { value: 'skin', label: 'Skin' }
  ];

  const filteredLocations = selectedOrgan === 'all' 
    ? organLocations 
    : organLocations.filter(loc => loc.organType === selectedOrgan);

  const handleRefresh = () => {
    setLoading(true);
    setMapKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Organ Availability Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-gray-600">Loading map data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Live Organ Availability Map</span>
            </CardTitle>
            <CardDescription>
              Real-time organ availability across medical centers
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedOrgan} onValueChange={setSelectedOrgan}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {organTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredLocations.filter(loc => loc.priority === 'critical').length}
              </div>
              <div className="text-sm text-red-700">Critical Centers</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredLocations.reduce((sum, loc) => sum + loc.availableCount, 0)}
              </div>
              <div className="text-sm text-orange-700">Total Available</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredLocations.reduce((sum, loc) => sum + loc.criticalCount, 0)}
              </div>
              <div className="text-sm text-blue-700">Critical Need</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredLocations.length}
              </div>
              <div className="text-sm text-green-700">Active Centers</div>
            </div>
          </div>

          {/* Map */}
          <div className="h-96 rounded-lg overflow-hidden border">
            <MapContainer
              key={mapKey}
              center={[39.8283, -98.5795]} // Center of US
              zoom={4}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController selectedOrgan={selectedOrgan} organLocations={filteredLocations} />
              
              {filteredLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  icon={createCustomIcon(location.color, location.organType)}
                >
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <div className="flex items-center space-x-2 mb-2">
                        <location.icon className={`w-4 h-4 ${location.color}`} />
                        <h3 className="font-semibold">{location.name}</h3>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Available:</span>
                          <Badge variant="outline" className="text-green-600">
                            {location.availableCount}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical Need:</span>
                          <Badge variant={location.criticalCount > 0 ? "destructive" : "outline"}>
                            {location.criticalCount}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Organ:</span>
                          <span className="font-medium">{location.organLabel}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Updated: {location.lastUpdated}
                        </div>
                        <div className="text-xs text-gray-500">
                          Contact: {location.contact}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Critical Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm">High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Low Priority</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganAvailabilityMap;
