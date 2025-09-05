import React from 'react';
import toast from 'react-hot-toast';

const sqlSchema = `
-- Drop existing objects to ensure a clean setup.
-- This makes the script idempotent (runnable multiple times).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.portfolio_items;
DROP TABLE IF EXISTS public.proposals;
DROP TABLE IF EXISTS public.jobs;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.job_status;
DROP TYPE IF EXISTS public.proposal_status;

-- Create Profiles Table
-- This table stores public profile data for users.
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamz,
  full_name text,
  avatar_url text,
  role text CHECK (role IN ('client', 'designer', 'admin')),
  bio text,
  skills text[],
  is_verified boolean DEFAULT false
);
-- Add comments for clarity
COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile." ON public.profiles FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- Create Jobs Table
-- This table stores job postings from clients.
CREATE TABLE public.jobs (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL,
  deadline date,
  required_skills text[],
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed'))
);
-- Add comments
COMMENT ON TABLE public.jobs IS 'Job postings created by clients.';
-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
-- Policies for jobs
CREATE POLICY "Jobs are viewable by everyone." ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Clients can create jobs." ON public.jobs FOR INSERT WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client' AND client_id = auth.uid() );
CREATE POLICY "Clients can update their own jobs." ON public.jobs FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client' AND client_id = auth.uid() );
CREATE POLICY "Admins can update any job." ON public.jobs FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Create Proposals Table
-- This table stores proposals submitted by designers for jobs.
CREATE TABLE public.proposals (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  designer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter text NOT NULL,
  proposed_price numeric NOT NULL,
  proposed_timeline text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected'))
);
-- Add comments
COMMENT ON TABLE public.proposals IS 'Proposals from designers for specific jobs.';
-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
-- Policies for proposals
CREATE POLICY "Proposals are viewable by the designer who created it or the client who owns the job." ON public.proposals FOR SELECT USING ( designer_id = auth.uid() OR (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = proposals.job_id AND jobs.client_id = auth.uid())) );
CREATE POLICY "Designers can submit proposals." ON public.proposals FOR INSERT WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'designer' AND designer_id = auth.uid() );
CREATE POLICY "Users can update their own proposals." ON public.proposals FOR UPDATE USING ( designer_id = auth.uid() );
CREATE POLICY "Clients can update proposal status on their jobs." ON public.proposals FOR UPDATE USING ( (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = proposals.job_id AND jobs.client_id = auth.uid())) );


-- Create Portfolio Items Table
-- Stores portfolio pieces for designers.
CREATE TABLE public.portfolio_items (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text,
  title text NOT NULL,
  description text
);
-- Add comments
COMMENT ON TABLE public.portfolio_items IS 'Portfolio items for designers to showcase their work.';
-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
-- Policies for portfolio
CREATE POLICY "Portfolio items are viewable by everyone." ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Designers can insert their own portfolio items." ON public.portfolio_items FOR INSERT WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'designer' AND designer_id = auth.uid() );
CREATE POLICY "Designers can update their own portfolio items." ON public.portfolio_items FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'designer' AND designer_id = auth.uid() );


-- Create Messages Table
CREATE TABLE public.messages (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  content text NOT NULL
);
COMMENT ON TABLE public.messages IS 'Direct messages between users about a job.';
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages they sent or received." ON public.messages FOR SELECT USING ( sender_id = auth.uid() OR receiver_id = auth.uid() );
CREATE POLICY "Users can send messages." ON public.messages FOR INSERT WITH CHECK ( sender_id = auth.uid() );


-- Function to create a new profile for a new user from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user is added
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- For Telegram OAuth, ensure metadata is passed correctly.
-- This function and trigger handles new user sign-ups, including those via OAuth.
-- The app's sign-up form passes 'role' and 'full_name' in metadata.
-- OAuth providers like Telegram pass 'full_name' and 'avatar_url'.
-- The function gracefully handles either case.

-- ---------------------------------------------------------------------------
-- Supabase Storage Setup for Avatars
-- ---------------------------------------------------------------------------
-- 1. Create a new bucket named 'avatars' in your Supabase project's Storage section.
--    Make sure to mark the bucket as "Public".
--
-- 2. After creating the bucket, run the following SQL policies to secure it.
--    These policies allow anyone to view avatars, but only authenticated
--    users can upload, update, or delete their OWN avatar.
-- ---------------------------------------------------------------------------

-- Drop existing policies to make the script re-runnable.
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatar." ON storage.objects;

-- Policy: Allow public read access to all files in the 'avatars' bucket.
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Allow authenticated users to upload an avatar into a folder named with their user ID.
CREATE POLICY "Authenticated users can upload their own avatar."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Policy: Allow authenticated users to update their own avatar.
CREATE POLICY "Authenticated users can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Policy: Allow authenticated users to delete their own avatar.
CREATE POLICY "Authenticated users can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );
`;

const DatabaseSetup: React.FC = () => {
    const handleCopy = () => {
        navigator.clipboard.writeText(sqlSchema);
        toast.success('SQL script copied to clipboard!');
    };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md my-8 max-w-4xl mx-auto" role="alert">
      <h2 className="text-2xl font-bold mb-4">Project Setup Required</h2>
      <p className="mb-4">
        It looks like your Supabase project is missing some configuration (either database tables or storage setup). This can cause errors when using the application.
      </p>
      <p className="mb-4">
        To fix this, please follow the instructions below.
      </p>

      <h3 className="text-xl font-bold mb-2 mt-6">1. Storage Bucket Setup (for Avatars)</h3>
       <p className="mb-4">
        To enable user avatar uploads, you need to set up Supabase Storage. The required security policies are included in the SQL script below, but you must create the storage "bucket" first.
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li>Go to the <strong>Storage</strong> section in your Supabase dashboard.</li>
        <li>Click <strong>New Bucket</strong>, name it <code className="bg-gray-200 text-red-800 p-1 rounded font-mono">avatars</code>, and check the <strong>Public</strong> box to make it a public bucket.</li>
        <li>After creating the bucket, continue to the next step.</li>
      </ol>

      <h3 className="text-xl font-bold mb-2 mt-6">2. Database Schema &amp; Policies Setup</h3>
      <p className="mb-4">
        Run the following SQL script in your Supabase project's <strong>SQL Editor</strong>. This will create all the necessary tables, functions, and security policies (including for the 'avatars' storage bucket you just created).
      </p>

      <div className="relative bg-gray-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
        <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-300"
            title="Copy to Clipboard"
            aria-label="Copy SQL schema to clipboard"
        >
            Copy
        </button>
        <pre><code>{sqlSchema}</code></pre>
      </div>
      <p className="mt-4 text-sm">
        After completing these steps, please refresh this page to continue.
      </p>
    </div>
  );
};

export default DatabaseSetup;