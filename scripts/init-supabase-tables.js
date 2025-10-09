#!/usr/bin/env node

const SUPABASE_URL = 'https://depozngjqxfjtgiwyuhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcG96bmdqcXhmanRnaXd5dWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzg2ODMsImV4cCI6MjA3NDMxNDY4M30.2GGuWW2KOf6C3CiC83DHhHSj39R1Xpx3MVWHOHudm2Q';

// SQL commands to create the tables
const createTablesSQL = `
-- Create medical_centers table
CREATE TABLE IF NOT EXISTS medical_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_phone TEXT,
  specialties TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create live_organ_availability table
CREATE TABLE IF NOT EXISTS live_organ_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organ_type TEXT NOT NULL,
  organ_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  location_name TEXT NOT NULL,
  location_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  blood_type TEXT,
  organ_age INTEGER,
  organ_size TEXT,
  urgency TEXT NOT NULL,
  time_remaining INTEGER,
  donor_id TEXT,
  donor_name TEXT,
  medical_center_id UUID REFERENCES medical_centers(id),
  medical_center_name TEXT,
  contact_info TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organ_transplant_logs table
CREATE TABLE IF NOT EXISTS organ_transplant_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organ_id UUID REFERENCES live_organ_availability(id),
  action TEXT NOT NULL,
  details JSONB,
  performed_by TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_centers_active ON medical_centers(is_active);
CREATE INDEX IF NOT EXISTS idx_medical_centers_location ON medical_centers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_live_organs_status ON live_organ_availability(status);
CREATE INDEX IF NOT EXISTS idx_live_organs_location ON live_organ_availability(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_live_organs_expires ON live_organ_availability(expires_at);
CREATE INDEX IF NOT EXISTS idx_transplant_logs_organ ON organ_transplant_logs(organ_id);

-- Enable Row Level Security
ALTER TABLE medical_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_organ_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE organ_transplant_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for this demo)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON medical_centers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert access for all users" ON medical_centers FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update access for all users" ON medical_centers FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON live_organ_availability FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert access for all users" ON live_organ_availability FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update access for all users" ON live_organ_availability FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON organ_transplant_logs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert access for all users" ON organ_transplant_logs FOR INSERT WITH CHECK (true);
`;

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing Supabase database tables...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        sql: createTablesSQL
      })
    });

    if (response.ok) {
      console.log('✅ Database tables created successfully!');
      
      // Now insert sample medical centers
      await insertSampleMedicalCenters();
      
    } else {
      const error = await response.text();
      console.error('❌ Error creating tables:', error);
      
      // Try alternative approach - insert data directly
      console.log('🔄 Trying alternative approach...');
      await insertSampleMedicalCenters();
    }
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.log('🔄 Trying to insert sample data directly...');
    await insertSampleMedicalCenters();
  }
}

async function insertSampleMedicalCenters() {
  const medicalCenters = [
    {
      name: 'New York Medical Center',
      address: '123 Medical Drive',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      contact_phone: '+1-555-0101',
      specialties: ['heart', 'liver', 'kidney', 'lung']
    },
    {
      name: 'California Transplant Institute',
      address: '456 Health Avenue',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
      contact_phone: '+1-555-0102',
      specialties: ['heart', 'liver', 'kidney', 'pancreas']
    },
    {
      name: 'Texas Heart Center',
      address: '789 Cardiac Blvd',
      city: 'Houston',
      state: 'TX',
      country: 'USA',
      latitude: 29.7604,
      longitude: -95.3698,
      contact_phone: '+1-555-0103',
      specialties: ['heart', 'lung']
    },
    {
      name: 'Florida Liver Institute',
      address: '321 Organ Street',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      latitude: 25.7617,
      longitude: -80.1918,
      contact_phone: '+1-555-0104',
      specialties: ['liver', 'kidney']
    },
    {
      name: 'Illinois Organ Center',
      address: '654 Transplant Way',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      latitude: 41.8781,
      longitude: -87.6298,
      contact_phone: '+1-555-0105',
      specialties: ['heart', 'liver', 'kidney', 'lung', 'pancreas']
    }
  ];

  console.log('📋 Inserting sample medical centers...');
  
  for (const center of medicalCenters) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/medical_centers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(center)
      });

      if (response.ok) {
        console.log(`✅ Inserted: ${center.name}`);
      } else {
        const error = await response.text();
        console.log(`⚠️  ${center.name}: ${error}`);
      }
    } catch (error) {
      console.log(`⚠️  ${center.name}: ${error.message}`);
    }
  }
}

// Run the initialization
initializeDatabase();
