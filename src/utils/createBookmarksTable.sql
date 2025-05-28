
-- Create bookmarks table to enable bookmark functionality
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poll_id)
);

-- Add RLS policies to ensure proper access control
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own bookmarks
CREATE POLICY "Users can view their own bookmarks" 
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to create bookmarks
CREATE POLICY "Users can create bookmarks"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);
