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
import { LiveOrganTrackingService, LiveOrgan } from "@/services/LiveOrganTrackingService";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Remove the old interface as we'll use LiveOrgan from the service

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

const MapController = ({ selectedOrgan, organLocations }: { selectedOrgan: string; organLocations: LiveOrgan[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedOrgan && selectedOrgan !== 'all') {
      const filteredLocations = organLocations.filter(loc => loc.organ_type === selectedOrgan && loc.latitude && loc.longitude);
      if (filteredLocations.length > 0) {
        const bounds = L.latLngBounds(filteredLocations.map(loc => [loc.latitude!, loc.longitude!]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else {
      const validLocations = organLocations.filter(loc => loc.latitude && loc.longitude);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations.map(loc => [loc.latitude!, loc.longitude!]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [selectedOrgan, organLocations, map]);

  return null;
};

const OrganAvailabilityMap = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string>('all');
  const [organLocations, setOrganLocations] = useState<LiveOrgan[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    loadLiveOrgans();
    
    // Subscribe to real-time updates
    const unsubscribe = LiveOrganTrackingService.subscribeToLiveUpdates(
      'map',
      (organs) => {
        setOrganLocations(organs);
        setMapKey(prev => prev + 1); // Force map re-render
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loadLiveOrgans = async () => {
    setLoading(true);
    try {
      const organs = await LiveOrganTrackingService.getLiveOrgans();
      setOrganLocations(organs);
    } catch (error) {
      console.error('Error loading live organs:', error);
    } finally {
      setLoading(false);
    }
  };

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
    : organLocations.filter(loc => loc.organ_type === selectedOrgan);

  const handleRefresh = () => {
    setMapKey(prev => prev + 1);
    loadLiveOrgans();
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
                {filteredLocations.filter(loc => loc.urgency === 'critical').length}
              </div>
              <div className="text-sm text-red-700">Critical Priority</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredLocations.filter(loc => loc.status === 'available').length}
              </div>
              <div className="text-sm text-orange-700">Available Now</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredLocations.filter(loc => loc.status === 'matched').length}
              </div>
              <div className="text-sm text-blue-700">Matched</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {new Set(filteredLocations.map(loc => loc.medical_center_id).filter(Boolean)).size}
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
              
              {filteredLocations.filter(loc => loc.latitude && loc.longitude).map((location) => {
                const getOrganColor = (organType: string) => {
                  switch (organType) {
                    case 'heart': return '#ef4444';
                    case 'liver': return '#f97316';
                    case 'kidney': return '#3b82f6';
                    case 'lung': return '#8b5cf6';
                    case 'pancreas': return '#10b981';
                    default: return '#6b7280';
                  }
                };

                const getUrgencyColor = (urgency: string) => {
                  switch (urgency) {
                    case 'critical': return '#ef4444';
                    case 'high': return '#f97316';
                    case 'medium': return '#3b82f6';
                    case 'low': return '#10b981';
                    default: return '#6b7280';
                  }
                };

                return (
                  <Marker
                    key={location.id}
                    position={[location.latitude!, location.longitude!]}
                    icon={createCustomIcon(getUrgencyColor(location.urgency), location.organ_type)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[250px]">
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getOrganColor(location.organ_type) }}
                          />
                          <h3 className="font-semibold">{location.location_name}</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={location.status === 'available' ? "secondary" : "outline"} 
                                   className={location.status === 'available' ? "bg-green-100 text-green-800" : ""}>
                              {location.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Urgency:</span>
                            <Badge variant={location.urgency === 'critical' ? "destructive" : "outline"}>
                              {location.urgency}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Organ:</span>
                            <span className="font-medium">{location.organ_label}</span>
                          </div>
                          {location.blood_type && (
                            <div className="flex justify-between">
                              <span>Blood Type:</span>
                              <span className="font-medium">{location.blood_type}</span>
                            </div>
                          )}
                          {location.time_remaining && (
                            <div className="flex justify-between">
                              <span>Time Left:</span>
                              <span className="font-medium">{location.time_remaining}h</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Updated: {new Date(location.updated_at).toLocaleString()}
                          </div>
                          {location.contact_info && (
                            <div className="text-xs text-gray-500">
                              Contact: {location.contact_info}
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
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
