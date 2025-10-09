-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE live_organ_availability;
ALTER PUBLICATION supabase_realtime ADD TABLE organ_transplant_logs;

-- Create live organ availability table
CREATE TABLE IF NOT EXISTS live_organ_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organ_type VARCHAR(50) NOT NULL,
    organ_label VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- available, in_transit, matched, transplanted
    location_name VARCHAR(255) NOT NULL,
    location_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    blood_type VARCHAR(10),
    organ_age INTEGER,
    organ_size VARCHAR(50),
    urgency VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
    time_remaining INTEGER, -- hours
    recipient_id UUID REFERENCES profiles(id),
    recipient_name VARCHAR(255),
    recipient_location VARCHAR(255),
    recipient_urgency VARCHAR(50),
    contact_info TEXT,
    medical_center_id UUID,
    medical_center_name VARCHAR(255),
    donor_id UUID REFERENCES profiles(id),
    donor_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    blockchain_hash VARCHAR(66),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT
);

-- Create organ transplant logs table for audit trail
CREATE TABLE IF NOT EXISTS organ_transplant_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organ_id UUID REFERENCES live_organ_availability(id),
    action VARCHAR(100) NOT NULL, -- created, matched, in_transit, transplanted, expired, cancelled
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    details JSONB,
    location VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blockchain_hash VARCHAR(66)
);

-- Create medical centers table
CREATE TABLE IF NOT EXISTS medical_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    specialties TEXT[], -- array of organ types they handle
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_organs_type ON live_organ_availability(organ_type);
CREATE INDEX IF NOT EXISTS idx_live_organs_status ON live_organ_availability(status);
CREATE INDEX IF NOT EXISTS idx_live_organs_location ON live_organ_availability(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_live_organs_urgency ON live_organ_availability(urgency);
CREATE INDEX IF NOT EXISTS idx_live_organs_updated ON live_organ_availability(updated_at);

CREATE INDEX IF NOT EXISTS idx_transplant_logs_organ ON organ_transplant_logs(organ_id);
CREATE INDEX IF NOT EXISTS idx_transplant_logs_timestamp ON organ_transplant_logs(timestamp);

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION update_organ_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
CREATE TRIGGER update_live_organ_availability_timestamp
    BEFORE UPDATE ON live_organ_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_organ_timestamp();

-- Function to log organ status changes
CREATE OR REPLACE FUNCTION log_organ_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the status change
    INSERT INTO organ_transplant_logs (
        organ_id,
        action,
        actor_id,
        actor_name,
        actor_role,
        details,
        location,
        timestamp
    ) VALUES (
        NEW.id,
        NEW.status,
        NEW.donor_id,
        NEW.donor_name,
        'system',
        jsonb_build_object(
            'old_status', OLD.status,
            'new_status', NEW.status,
            'organ_type', NEW.organ_type,
            'location', NEW.location_name
        ),
        NEW.location_name,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging status changes
CREATE TRIGGER log_organ_status_change_trigger
    AFTER UPDATE ON live_organ_availability
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_organ_status_change();

-- Function to automatically expire organs after certain time
CREATE OR REPLACE FUNCTION expire_old_organs()
RETURNS void AS $$
BEGIN
    UPDATE live_organ_availability 
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('available', 'matched') 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Log expired organs
    INSERT INTO organ_transplant_logs (organ_id, action, details, timestamp)
    SELECT id, 'expired', jsonb_build_object('reason', 'time_expired'), NOW()
    FROM live_organ_availability 
    WHERE status = 'expired' 
    AND updated_at > NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Insert some sample medical centers
INSERT INTO medical_centers (name, address, city, state, country, latitude, longitude, contact_phone, specialties) VALUES
('New York Medical Center', '123 Medical Drive', 'New York', 'NY', 'USA', 40.7128, -74.0060, '+1-555-0101', ARRAY['heart', 'liver', 'kidney', 'lung']),
('California Transplant Institute', '456 Health Blvd', 'Los Angeles', 'CA', 'USA', 34.0522, -118.2437, '+1-555-0102', ARRAY['heart', 'kidney', 'pancreas']),
('Texas Heart Center', '789 Cardiac Lane', 'Houston', 'TX', 'USA', 29.7604, -95.3698, '+1-555-0103', ARRAY['heart', 'lung']),
('Florida Liver Institute', '321 Hepatic St', 'Miami', 'FL', 'USA', 25.7617, -80.1918, '+1-555-0104', ARRAY['liver', 'kidney']),
('Illinois Organ Center', '654 Transplant Ave', 'Chicago', 'IL', 'USA', 41.8781, -87.6298, '+1-555-0105', ARRAY['liver', 'kidney', 'pancreas']),
('Washington Kidney Center', '987 Renal Rd', 'Seattle', 'WA', 'USA', 47.6062, -122.3321, '+1-555-0106', ARRAY['kidney']),
('Ohio Kidney Institute', '147 Urology Way', 'Columbus', 'OH', 'USA', 39.9612, -82.9988, '+1-555-0107', ARRAY['kidney', 'liver']),
('Pennsylvania Transplant Center', '258 Organ Blvd', 'Philadelphia', 'PA', 'USA', 39.9526, -75.1652, '+1-555-0108', ARRAY['kidney', 'heart']),
('Michigan Medical Center', '369 Health Center Dr', 'Detroit', 'MI', 'USA', 42.3314, -83.0458, '+1-555-0109', ARRAY['kidney', 'liver', 'heart']),
('Georgia Organ Bank', '741 Transplant Way', 'Atlanta', 'GA', 'USA', 33.7490, -84.3880, '+1-555-0110', ARRAY['kidney', 'liver']),
('Colorado Lung Center', '852 Pulmonary Pkwy', 'Denver', 'CO', 'USA', 39.7392, -104.9903, '+1-555-0111', ARRAY['lung', 'heart']),
('Arizona Pulmonary Institute', '963 Respiratory Rd', 'Phoenix', 'AZ', 'USA', 33.4484, -112.0740, '+1-555-0112', ARRAY['lung']),
('Massachusetts Pancreas Center', '159 Endocrine Ave', 'Boston', 'MA', 'USA', 42.3601, -71.0589, '+1-555-0113', ARRAY['pancreas']);

-- Create RLS policies
ALTER TABLE live_organ_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE organ_transplant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_centers ENABLE ROW LEVEL SECURITY;

-- Policies for live_organ_availability
CREATE POLICY "Anyone can view live organs" ON live_organ_availability FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert organs" ON live_organ_availability FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own organs" ON live_organ_availability FOR UPDATE USING (auth.uid() = donor_id OR auth.uid() = recipient_id);
CREATE POLICY "Admins can update any organ" ON live_organ_availability FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for organ_transplant_logs
CREATE POLICY "Anyone can view transplant logs" ON organ_transplant_logs FOR SELECT USING (true);
CREATE POLICY "System can insert logs" ON organ_transplant_logs FOR INSERT WITH CHECK (true);

-- Policies for medical_centers
CREATE POLICY "Anyone can view medical centers" ON medical_centers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage medical centers" ON medical_centers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
