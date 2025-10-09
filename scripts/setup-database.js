import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up live organ tracking database...');

  try {
    // Create medical centers table
    console.log('Creating medical centers...');
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
        address: '456 Health Blvd',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        contact_phone: '+1-555-0102',
        specialties: ['heart', 'kidney', 'pancreas']
      },
      {
        name: 'Texas Heart Center',
        address: '789 Cardiac Lane',
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
        address: '321 Hepatic St',
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
        address: '654 Transplant Ave',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        latitude: 41.8781,
        longitude: -87.6298,
        contact_phone: '+1-555-0105',
        specialties: ['liver', 'kidney', 'pancreas']
      },
      {
        name: 'Washington Kidney Center',
        address: '987 Renal Rd',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        latitude: 47.6062,
        longitude: -122.3321,
        contact_phone: '+1-555-0106',
        specialties: ['kidney']
      },
      {
        name: 'Ohio Kidney Institute',
        address: '147 Urology Way',
        city: 'Columbus',
        state: 'OH',
        country: 'USA',
        latitude: 39.9612,
        longitude: -82.9988,
        contact_phone: '+1-555-0107',
        specialties: ['kidney', 'liver']
      },
      {
        name: 'Pennsylvania Transplant Center',
        address: '258 Organ Blvd',
        city: 'Philadelphia',
        state: 'PA',
        country: 'USA',
        latitude: 39.9526,
        longitude: -75.1652,
        contact_phone: '+1-555-0108',
        specialties: ['kidney', 'heart']
      },
      {
        name: 'Michigan Medical Center',
        address: '369 Health Center Dr',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        latitude: 42.3314,
        longitude: -83.0458,
        contact_phone: '+1-555-0109',
        specialties: ['kidney', 'liver', 'heart']
      },
      {
        name: 'Georgia Organ Bank',
        address: '741 Transplant Way',
        city: 'Atlanta',
        state: 'GA',
        country: 'USA',
        latitude: 33.7490,
        longitude: -84.3880,
        contact_phone: '+1-555-0110',
        specialties: ['kidney', 'liver']
      },
      {
        name: 'Colorado Lung Center',
        address: '852 Pulmonary Pkwy',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        latitude: 39.7392,
        longitude: -104.9903,
        contact_phone: '+1-555-0111',
        specialties: ['lung', 'heart']
      },
      {
        name: 'Arizona Pulmonary Institute',
        address: '963 Respiratory Rd',
        city: 'Phoenix',
        state: 'AZ',
        country: 'USA',
        latitude: 33.4484,
        longitude: -112.0740,
        contact_phone: '+1-555-0112',
        specialties: ['lung']
      },
      {
        name: 'Massachusetts Pancreas Center',
        address: '159 Endocrine Ave',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        latitude: 42.3601,
        longitude: -71.0589,
        contact_phone: '+1-555-0113',
        specialties: ['pancreas']
      }
    ];

    // Insert medical centers
    const { error: centersError } = await supabase
      .from('medical_centers')
      .upsert(medicalCenters, { onConflict: 'name' });

    if (centersError) {
      console.error('Error creating medical centers:', centersError);
    } else {
      console.log('✅ Medical centers created successfully');
    }

    // Add some sample live organs
    console.log('Adding sample live organs...');
    const sampleOrgans = [
      {
        organ_type: 'heart',
        organ_label: 'Heart',
        status: 'available',
        location_name: 'New York Medical Center',
        location_address: '123 Medical Drive',
        latitude: 40.7128,
        longitude: -74.0060,
        blood_type: 'O+',
        organ_age: 25,
        organ_size: 'Medium',
        urgency: 'critical',
        time_remaining: 4,
        donor_name: 'Sample Donor',
        medical_center_name: 'New York Medical Center',
        contact_info: '+1-555-0101',
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        is_verified: true
      },
      {
        organ_type: 'liver',
        organ_label: 'Liver',
        status: 'available',
        location_name: 'California Transplant Institute',
        location_address: '456 Health Blvd',
        latitude: 34.0522,
        longitude: -118.2437,
        blood_type: 'A+',
        organ_age: 32,
        organ_size: 'Large',
        urgency: 'high',
        time_remaining: 8,
        donor_name: 'Sample Donor 2',
        medical_center_name: 'California Transplant Institute',
        contact_info: '+1-555-0102',
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        is_verified: true
      },
      {
        organ_type: 'kidney',
        organ_label: 'Kidney',
        status: 'matched',
        location_name: 'Ohio Kidney Institute',
        location_address: '147 Urology Way',
        latitude: 39.9612,
        longitude: -82.9988,
        blood_type: 'B+',
        organ_age: 28,
        organ_size: 'Medium',
        urgency: 'high',
        time_remaining: 12,
        recipient_name: 'Sarah Johnson',
        recipient_location: 'Pennsylvania Transplant Center',
        recipient_urgency: 'High',
        donor_name: 'Sample Donor 3',
        medical_center_name: 'Ohio Kidney Institute',
        contact_info: '+1-555-0107',
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        is_verified: true
      }
    ];

    const { error: organsError } = await supabase
      .from('live_organ_availability')
      .upsert(sampleOrgans);

    if (organsError) {
      console.error('Error creating sample organs:', organsError);
    } else {
      console.log('✅ Sample organs created successfully');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('You can now:');
    console.log('1. Register organ donations that will appear on the live map');
    console.log('2. View real-time organ availability');
    console.log('3. Track organ status changes');
    console.log('4. See live updates across all components');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
