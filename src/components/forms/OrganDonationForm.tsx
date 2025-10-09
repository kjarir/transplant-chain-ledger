import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import OrganAvailabilityDropdown from "@/components/OrganAvailabilityDropdown";
import { supabase } from "@/integrations/supabase/client";
import { LiveOrganTrackingService, MedicalCenter } from "@/services/LiveOrganTrackingService";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, User, Link } from "lucide-react";

interface OrganDonationFormProps {
  donorId: string;
  onSuccess: () => void;
}

const OrganDonationForm = ({ donorId, onSuccess }: OrganDonationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const { createOrganDonation, isConnected } = useBlockchain();
  const [formData, setFormData] = useState({
    organType: '',
    medicalHistory: '',
    consentConfirmed: false,
    emergencyContact: '',
    medicalCenterId: '',
    bloodType: '',
    organAge: '',
    organSize: '',
    urgency: 'medium',
    timeRemaining: 72 // 72 hours default
  });

  const organTypes = [
    { value: 'heart', label: 'Heart' },
    { value: 'kidney', label: 'Kidney' },
    { value: 'liver', label: 'Liver' },
    { value: 'lung', label: 'Lung' },
    { value: 'pancreas', label: 'Pancreas' },
    { value: 'cornea', label: 'Cornea' },
    { value: 'bone', label: 'Bone' },
    { value: 'skin', label: 'Skin' }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organSizes = ['Small', 'Medium', 'Large'];
  const urgencyLevels = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' }
  ];

  useEffect(() => {
    loadMedicalCenters();
  }, []);

  const loadMedicalCenters = async () => {
    setLoadingCenters(true);
    try {
      const centers = await LiveOrganTrackingService.getMedicalCenters();
      if (centers.length === 0) {
        // Fallback: Initialize database and load centers
        console.log('No medical centers found, initializing database...');
        const { DatabaseInitializer } = await import('@/services/DatabaseInitializer');
        const success = await DatabaseInitializer.initializeDatabase();
        if (success) {
          const newCenters = await LiveOrganTrackingService.getMedicalCenters();
          setMedicalCenters(newCenters);
        } else {
          // Use hardcoded fallback centers
          setMedicalCenters(getFallbackCenters());
        }
      } else {
        setMedicalCenters(centers);
      }
    } catch (error) {
      console.error('Error loading medical centers:', error);
      // Use hardcoded fallback centers
      setMedicalCenters(getFallbackCenters());
    } finally {
      setLoadingCenters(false);
    }
  };

  const getFallbackCenters = () => [
    {
      id: '1',
      name: 'New York Medical Center',
      address: '123 Medical Drive',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      contact_phone: '+1-555-0101',
      specialties: ['heart', 'liver', 'kidney', 'lung'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'California Transplant Institute',
      address: '456 Health Blvd',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
      contact_phone: '+1-555-0102',
      specialties: ['heart', 'kidney', 'pancreas'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Texas Heart Center',
      address: '789 Cardiac Lane',
      city: 'Houston',
      state: 'TX',
      country: 'USA',
      latitude: 29.7604,
      longitude: -95.3698,
      contact_phone: '+1-555-0103',
      specialties: ['heart', 'lung'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Florida Liver Institute',
      address: '321 Hepatic St',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      latitude: 25.7617,
      longitude: -80.1918,
      contact_phone: '+1-555-0104',
      specialties: ['liver', 'kidney'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Illinois Organ Center',
      address: '654 Transplant Ave',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      latitude: 41.8781,
      longitude: -87.6298,
      contact_phone: '+1-555-0105',
      specialties: ['liver', 'kidney', 'pancreas'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Washington Kidney Center',
      address: '987 Renal Rd',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      latitude: 47.6062,
      longitude: -122.3321,
      contact_phone: '+1-555-0106',
      specialties: ['kidney'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Ohio Kidney Institute',
      address: '147 Urology Way',
      city: 'Columbus',
      state: 'OH',
      country: 'USA',
      latitude: 39.9612,
      longitude: -82.9988,
      contact_phone: '+1-555-0107',
      specialties: ['kidney', 'liver'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Pennsylvania Transplant Center',
      address: '258 Organ Blvd',
      city: 'Philadelphia',
      state: 'PA',
      country: 'USA',
      latitude: 39.9526,
      longitude: -75.1652,
      contact_phone: '+1-555-0108',
      specialties: ['kidney', 'heart'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '9',
      name: 'Michigan Medical Center',
      address: '369 Health Center Dr',
      city: 'Detroit',
      state: 'MI',
      country: 'USA',
      latitude: 42.3314,
      longitude: -83.0458,
      contact_phone: '+1-555-0109',
      specialties: ['kidney', 'liver', 'heart'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10',
      name: 'Georgia Organ Bank',
      address: '741 Transplant Way',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      latitude: 33.7490,
      longitude: -84.3880,
      contact_phone: '+1-555-0110',
      specialties: ['kidney', 'liver'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '11',
      name: 'Colorado Lung Center',
      address: '852 Pulmonary Pkwy',
      city: 'Denver',
      state: 'CO',
      country: 'USA',
      latitude: 39.7392,
      longitude: -104.9903,
      contact_phone: '+1-555-0111',
      specialties: ['lung', 'heart'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '12',
      name: 'Arizona Pulmonary Institute',
      address: '963 Respiratory Rd',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      latitude: 33.4484,
      longitude: -112.0740,
      contact_phone: '+1-555-0112',
      specialties: ['lung'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '13',
      name: 'Massachusetts Pancreas Center',
      address: '159 Endocrine Ave',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      latitude: 42.3601,
      longitude: -71.0589,
      contact_phone: '+1-555-0113',
      specialties: ['pancreas'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentConfirmed) {
      toast({
        title: "Consent Required",
        description: "Please confirm your consent to donate the organ.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.medicalCenterId) {
      toast({
        title: "Medical Center Required",
        description: "Please select a medical center for your donation.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get donor profile for name
      const { data: donorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', donorId)
        .single();

      // Get selected medical center
      const selectedCenter = medicalCenters.find(c => c.id === formData.medicalCenterId);
      if (!selectedCenter) {
        throw new Error('Selected medical center not found');
      }

      let blockchainHash = null;

      // Create organ donation on blockchain if wallet is connected
      if (isConnected) {
        try {
          console.log('🔗 Creating organ donation on blockchain...');
          const blockchainResult = await createOrganDonation({
            organ_type: formData.organType
          });
          blockchainHash = blockchainResult.txHash;
          console.log('✅ Blockchain transaction successful:', blockchainHash);
        } catch (blockchainError) {
          console.warn('⚠️ Blockchain transaction failed:', blockchainError);
          // Continue with database operations even if blockchain fails
        }
      } else {
        console.log('⚠️ Wallet not connected, skipping blockchain registration');
      }

      // Insert into organ_donations table
      const { error: donationError } = await supabase.from('organ_donations').insert({
        donor_id: donorId,
        organ_type: formData.organType as any,
        status: 'pending',
        medical_clearance: false,
        blockchain_hash: blockchainHash
      });

      if (donationError) throw donationError;

      // Add to live organ tracking
      const liveOrganData = {
        organ_type: formData.organType,
        organ_label: organTypes.find(t => t.value === formData.organType)?.label || formData.organType,
        status: 'available',
        location_name: selectedCenter.name,
        location_address: selectedCenter.address,
        latitude: selectedCenter.latitude,
        longitude: selectedCenter.longitude,
        blood_type: formData.bloodType,
        organ_age: formData.organAge ? parseInt(formData.organAge) : undefined,
        organ_size: formData.organSize,
        urgency: formData.urgency,
        time_remaining: formData.timeRemaining,
        donor_id: donorId,
        donor_name: donorProfile?.full_name || 'Anonymous Donor',
        medical_center_id: selectedCenter.id,
        medical_center_name: selectedCenter.name,
        contact_info: selectedCenter.contact_phone,
        expires_at: new Date(Date.now() + formData.timeRemaining * 60 * 60 * 1000).toISOString(),
        blockchain_hash: blockchainHash
      };

      const liveOrgan = await LiveOrganTrackingService.addLiveOrgan(liveOrganData);
      
      if (liveOrgan) {
        const blockchainMessage = blockchainHash 
          ? ` ✅ Blockchain transaction: ${blockchainHash.slice(0, 10)}...`
          : ' ⚠️ Wallet not connected - blockchain registration skipped';
        
        toast({
          title: "Donation Registered & Live Tracking Started",
          description: `Your ${formData.organType} donation is now live and visible on the map at ${selectedCenter.name}.${blockchainMessage}`
        });
      } else {
        const blockchainMessage = blockchainHash 
          ? ` ✅ Blockchain transaction: ${blockchainHash.slice(0, 10)}...`
          : ' ⚠️ Wallet not connected - blockchain registration skipped';
        
        toast({
          title: "Donation Registered",
          description: `Your organ donation has been registered successfully, but live tracking failed to start.${blockchainMessage}`,
          variant: "destructive"
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error registering donation:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register organ donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900">Organ Donation Registration</h2>
        <div className="flex items-center space-x-2">
          <Link className="w-4 h-4" />
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
            {isConnected ? 'Blockchain Connected' : 'Wallet Not Connected'}
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        <div className="space-y-2">
          <Label htmlFor="organ-type">Organ Type</Label>
          <OrganAvailabilityDropdown
            onOrganSelect={(organType) => setFormData({ ...formData, organType })}
            showDetails={false}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Select an organ type to see current availability and priority levels
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blood-type">Blood Type</Label>
          <Select value={formData.bloodType} onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              {bloodTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organ-age">Donor Age</Label>
          <Input
            id="organ-age"
            type="number"
            placeholder="Age in years"
            value={formData.organAge}
            onChange={(e) => setFormData({ ...formData, organAge: e.target.value })}
            min="18"
            max="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organ-size">Organ Size</Label>
          <Select value={formData.organSize} onValueChange={(value) => setFormData({ ...formData, organSize: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select organ size" />
            </SelectTrigger>
            <SelectContent>
              {organSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency Level</Label>
          <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical-center">Medical Center</Label>
        <Select value={formData.medicalCenterId} onValueChange={(value) => setFormData({ ...formData, medicalCenterId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select medical center for donation" />
          </SelectTrigger>
          <SelectContent>
            {loadingCenters ? (
              <div className="p-2 text-sm text-gray-500">
                Loading medical centers...
              </div>
            ) : medicalCenters.length > 0 ? (
              medicalCenters.map((center) => (
                <SelectItem key={center.id} value={center.id}>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{center.name}</div>
                      <div className="text-xs text-gray-500">{center.city}, {center.state}</div>
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">
                No medical centers available
              </div>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This will determine where your organ appears on the live map
        </p>
        {medicalCenters.length === 0 && (
          <p className="text-xs text-orange-600">
            No medical centers available. Please contact admin to initialize the database.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-remaining">Time Remaining (Hours)</Label>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <Input
            id="time-remaining"
            type="number"
            placeholder="72"
            value={formData.timeRemaining}
            onChange={(e) => setFormData({ ...formData, timeRemaining: parseInt(e.target.value) || 72 })}
            min="1"
            max="168"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          How long the organ remains viable for transplant (1-168 hours)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical-history">Medical History</Label>
        <Textarea
          id="medical-history"
          placeholder="Please provide your relevant medical history..."
          value={formData.medicalHistory}
          onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergency-contact">Emergency Contact</Label>
        <Textarea
          id="emergency-contact"
          placeholder="Emergency contact name and phone number..."
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="consent"
          checked={formData.consentConfirmed}
          onCheckedChange={(checked) => setFormData({ ...formData, consentConfirmed: checked as boolean })}
        />
        <Label htmlFor="consent" className="text-sm">
          I confirm my consent to donate the selected organ and understand that medical verification is required.
        </Label>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Important Information</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Medical professionals will verify your eligibility</li>
          <li>• Your donation will be recorded on the blockchain for transparency</li>
          <li>• You can track the allocation process through your dashboard</li>
          <li>• All personal information is kept confidential</li>
        </ul>
      </div>

        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t p-4 -mx-1">
          <Button type="submit" variant="medical" className="flex-1" disabled={loading || !formData.consentConfirmed}>
            {loading ? 'Registering...' : 'Register Donation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrganDonationForm;