-- Supabase Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reading_time INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (post_id, tag_id)
);

-- Create weather_data table for caching weather information
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    pressure DECIMAL(7,2),
    wind_dir INTEGER,
    feels_like DECIMAL(5,2),
    source VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on timestamp for weather data queries
CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather_data(timestamp DESC);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for posts table
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE
    ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove if not needed)
INSERT INTO posts (slug, title, description, content, date, reading_time) VALUES
    ('welcome-to-my-blog', 'Welcome to My Blog', 'An introduction to my personal blog and what to expect.', '# Welcome\n\nThis is my personal blog where I share thoughts about technology, development, and life.\n\n## What to Expect\n\n- Technical tutorials\n- Development insights\n- Personal projects\n- Industry observations', '2024-01-01', 3),
    ('getting-started-with-typescript', 'Getting Started with TypeScript', 'A comprehensive guide to TypeScript for beginners.', '# Getting Started with TypeScript\n\nTypeScript is a powerful superset of JavaScript that adds static typing.\n\n## Installation\n\n```bash\nnpm install -g typescript\n```\n\n## Your First TypeScript File\n\n```typescript\nconst greeting: string = "Hello, TypeScript!";\nconsole.log(greeting);\n```', '2024-01-15', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
    ('Technology', 'technology'),
    ('TypeScript', 'typescript'),
    ('Web Development', 'web-development'),
    ('Personal', 'personal')
ON CONFLICT (slug) DO NOTHING;

-- Link posts with tags
INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'welcome-to-my-blog' AND t.slug IN ('personal', 'technology')
ON CONFLICT DO NOTHING;

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'getting-started-with-typescript' AND t.slug IN ('typescript', 'web-development', 'technology')
ON CONFLICT DO NOTHING;

-- Grant permissions (Supabase handles this automatically but included for completeness)
-- These will work with Supabase's Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to post_tags" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to weather_data" ON weather_data
    FOR SELECT USING (true);

-- For authenticated users (if you plan to add admin features later)
CREATE POLICY "Allow authenticated users to insert posts" ON posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update posts" ON posts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete posts" ON posts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for tags and weather_data
CREATE POLICY "Allow authenticated users to manage tags" ON tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage weather_data" ON weather_data
    FOR ALL USING (auth.role() = 'authenticated');

-- Create a view for posts with tags (optional but useful)
CREATE OR REPLACE VIEW posts_with_tags AS
SELECT 
    p.*,
    COALESCE(
        STRING_AGG(t.name, ', ' ORDER BY t.name),
        ''
    ) as tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.tag_id
GROUP BY p.id;