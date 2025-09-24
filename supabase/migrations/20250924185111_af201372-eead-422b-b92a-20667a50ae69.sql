-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('patient', 'donor', 'doctor', 'admin');

-- Create organ types enum
CREATE TYPE public.organ_type AS ENUM ('heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea', 'bone', 'skin');

-- Create status enums
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'matched', 'transplanted', 'rejected');
CREATE TYPE public.donor_status AS ENUM ('pending', 'verified', 'available', 'allocated', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  blood_type TEXT,
  medical_history TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organ requests table (for patients)
CREATE TABLE public.organ_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organ_type organ_type NOT NULL,
  urgency_level INTEGER CHECK (urgency_level BETWEEN 1 AND 5) DEFAULT 3,
  medical_condition TEXT NOT NULL,
  doctor_notes TEXT,
  status request_status DEFAULT 'pending',
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organ donations table (for donors)
CREATE TABLE public.organ_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organ_type organ_type NOT NULL,
  status donor_status DEFAULT 'pending',
  medical_clearance BOOLEAN DEFAULT false,
  doctor_verified_by UUID REFERENCES public.profiles(id),
  matched_request_id UUID REFERENCES public.organ_requests(id),
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for blockchain records
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL,
  from_user_id UUID REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id),
  organ_request_id UUID REFERENCES public.organ_requests(id),
  organ_donation_id UUID REFERENCES public.organ_donations(id),
  status TEXT DEFAULT 'pending',
  blockchain_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organ_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organ_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can view their own requests" ON public.organ_requests
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can create requests" ON public.organ_requests
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'patient')
  );

CREATE POLICY "Doctors and admins can view all requests" ON public.organ_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('doctor', 'admin'))
  );

CREATE POLICY "Donors can view their own donations" ON public.organ_donations
  FOR SELECT USING (
    donor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Donors can create donations" ON public.organ_donations
  FOR INSERT WITH CHECK (
    donor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'donor')
  );

CREATE POLICY "Doctors and admins can view all donations" ON public.organ_donations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('doctor', 'admin'))
  );

CREATE POLICY "Authenticated users can view transactions" ON public.transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organ_requests_updated_at
  BEFORE UPDATE ON public.organ_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organ_donations_updated_at
  BEFORE UPDATE ON public.organ_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();