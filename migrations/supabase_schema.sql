-- Schema for Supabase database
-- This script can be run in the Supabase SQL Editor

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS title_idx ON public.posts (title);

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Post-Tags relation table
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id INTEGER NOT NULL REFERENCES public.posts(id),
  tag_id INTEGER NOT NULL REFERENCES public.tags(id)
);

-- Galleries table
CREATE TABLE IF NOT EXISTS public.galleries (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies
-- This will make tables readable by everyone but writable only by authenticated users

-- Posts RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.posts FOR DELETE USING (auth.role() = 'authenticated');

-- Tags RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.tags FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.tags FOR DELETE USING (auth.role() = 'authenticated');

-- Post Tags RLS
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.post_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.post_tags FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.post_tags FOR DELETE USING (auth.role() = 'authenticated');

-- Galleries RLS
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.galleries FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.galleries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.galleries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.galleries FOR DELETE USING (auth.role() = 'authenticated');