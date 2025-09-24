import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OrganDonationFormProps {
  donorId: string;
  onSuccess: () => void;
}

const OrganDonationForm = ({ donorId, onSuccess }: OrganDonationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organType: '',
    medicalHistory: '',
    consentConfirmed: false,
    emergencyContact: ''
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

    setLoading(true);

    try {
      const { error } = await supabase.from('organ_donations').insert({
        donor_id: donorId,
        organ_type: formData.organType as any,
        status: 'pending',
        medical_clearance: false
      });

      if (error) throw error;

      toast({
        title: "Donation Registered",
        description: "Your organ donation has been registered successfully. Medical verification will be scheduled soon."
      });

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="organ-type">Organ Type</Label>
        <Select value={formData.organType} onValueChange={(value) => setFormData({ ...formData, organType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select organ to donate" />
          </SelectTrigger>
          <SelectContent>
            {organTypes.map((organ) => (
              <SelectItem key={organ.value} value={organ.value}>
                {organ.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="medical" className="flex-1" disabled={loading || !formData.consentConfirmed}>
          {loading ? 'Registering...' : 'Register Donation'}
        </Button>
      </div>
    </form>
  );
};

export default OrganDonationForm;