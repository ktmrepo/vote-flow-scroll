/*
  # Bulk Upload System Migration

  1. New Tables
    - `bulk_uploads` - Track bulk upload sessions with status and metadata
    - `temp_user_uploads` - Temporary storage for user data during bulk upload
    - `temp_poll_uploads` - Temporary storage for poll data during bulk upload

  2. Security
    - Enable RLS on bulk_uploads table
    - Add policy for admins to manage bulk uploads

  3. Functions
    - `process_user_bulk_upload` - Process temporary user data into profiles
    - `process_poll_bulk_upload` - Process temporary poll data into polls table
*/

-- Create table to track bulk upload sessions
CREATE TABLE IF NOT EXISTS public.bulk_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  upload_type TEXT NOT NULL CHECK (upload_type IN ('users', 'polls', 'votes')),
  file_name TEXT NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on bulk_uploads
ALTER TABLE public.bulk_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Admins can manage bulk uploads" ON public.bulk_uploads;
CREATE POLICY "Admins can manage bulk uploads" ON public.bulk_uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create table to store temporary user data during bulk upload
CREATE TABLE IF NOT EXISTS public.temp_user_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_session_id UUID REFERENCES public.bulk_uploads(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table to store temporary poll data during bulk upload
CREATE TABLE IF NOT EXISTS public.temp_poll_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_session_id UUID REFERENCES public.bulk_uploads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  options JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to process user bulk uploads
CREATE OR REPLACE FUNCTION public.process_user_bulk_upload(upload_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  temp_user RECORD;
  user_id UUID;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM public.temp_user_uploads WHERE upload_session_id = process_user_bulk_upload.upload_session_id;
  
  -- Process each temporary user
  FOR temp_user IN 
    SELECT * FROM public.temp_user_uploads WHERE upload_session_id = process_user_bulk_upload.upload_session_id
  LOOP
    BEGIN
      -- Create user in auth.users (this would normally be done through Supabase Auth API)
      -- For now, we'll just create the profile assuming the user will be created separately
      
      -- Insert into profiles table
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (gen_random_uuid(), temp_user.email, temp_user.full_name, temp_user.role);
      
      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Update bulk upload status
  UPDATE public.bulk_uploads 
  SET 
    status = 'completed',
    total_records = total_count,
    successful_records = success_count,
    failed_records = error_count,
    completed_at = NOW()
  WHERE id = upload_session_id;
  
  -- Clean up temporary data
  DELETE FROM public.temp_user_uploads WHERE upload_session_id = process_user_bulk_upload.upload_session_id;
END;
$$;

-- Create function to process poll bulk uploads
CREATE OR REPLACE FUNCTION public.process_poll_bulk_upload(upload_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  temp_poll RECORD;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM public.temp_poll_uploads WHERE upload_session_id = process_poll_bulk_upload.upload_session_id;
  
  -- Process each temporary poll
  FOR temp_poll IN 
    SELECT * FROM public.temp_poll_uploads WHERE upload_session_id = process_poll_bulk_upload.upload_session_id
  LOOP
    BEGIN
      -- Insert into polls table
      INSERT INTO public.polls (title, description, category, options, created_by, is_active)
      VALUES (temp_poll.title, temp_poll.description, temp_poll.category, temp_poll.options, temp_poll.created_by, true);
      
      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Update bulk upload status
  UPDATE public.bulk_uploads 
  SET 
    status = 'completed',
    total_records = total_count,
    successful_records = success_count,
    failed_records = error_count,
    completed_at = NOW()
  WHERE id = upload_session_id;
  
  -- Clean up temporary data
  DELETE FROM public.temp_poll_uploads WHERE upload_session_id = process_poll_bulk_upload.upload_session_id;
END;
$$;