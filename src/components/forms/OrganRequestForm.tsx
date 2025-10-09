import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrganAvailabilityDropdown from "@/components/OrganAvailabilityDropdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OrganRequestFormProps {
  patientId: string;
  onSuccess: () => void;
}

const OrganRequestForm = ({ patientId, onSuccess }: OrganRequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organType: '',
    urgencyLevel: 3,
    medicalCondition: '',
    additionalNotes: ''
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

  const urgencyLevels = [
    { value: 1, label: 'Low Priority' },
    { value: 2, label: 'Medium Priority' },
    { value: 3, label: 'Normal Priority' },
    { value: 4, label: 'High Priority' },
    { value: 5, label: 'Critical Priority' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('organ_requests').insert({
        patient_id: patientId,
        organ_type: formData.organType as any,
        urgency_level: formData.urgencyLevel,
        medical_condition: formData.medicalCondition,
        doctor_notes: formData.additionalNotes || null,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your organ request has been submitted successfully. A medical professional will review it soon."
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit organ request. Please try again.",
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
        <OrganAvailabilityDropdown
          onOrganSelect={(organType) => setFormData({ ...formData, organType })}
          showDetails={true}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          View real-time availability and priority levels for each organ type
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency Level</Label>
        <Select 
          value={formData.urgencyLevel.toString()} 
          onValueChange={(value) => setFormData({ ...formData, urgencyLevel: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            {urgencyLevels.map((level) => (
              <SelectItem key={level.value} value={level.value.toString()}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical-condition">Medical Condition</Label>
        <Textarea
          id="medical-condition"
          placeholder="Describe your medical condition requiring organ transplant..."
          value={formData.medicalCondition}
          onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
        <Textarea
          id="additional-notes"
          placeholder="Any additional medical information or notes..."
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="medical" className="flex-1" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

export default OrganRequestForm;