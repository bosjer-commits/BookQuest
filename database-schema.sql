-- BookQuest Database Schema
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click "Run"

-- 1. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'kid')),
  language_preference TEXT DEFAULT 'english' CHECK (language_preference IN ('dutch', 'swedish', 'english')),
  avatar_url TEXT,
  currently_reading_book_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Create books table (main reading data)
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  year_published INTEGER,
  description TEXT,
  total_pages INTEGER,
  status TEXT NOT NULL CHECK (status IN ('favorites', 'in_progress', 'finished')),
  pages_read INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);

-- 3. Create friendships table
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_friendships_user_1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user_2 ON friendships(user_id_2);

-- 4. Now add policies for books (after friendships table exists)
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent') OR
    EXISTS (SELECT 1 FROM friendships WHERE (user_id_1 = auth.uid() AND user_id_2 = user_id) OR (user_id_2 = auth.uid() AND user_id_1 = user_id))
  );

CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Add policies for friendships
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (
    auth.uid() = user_id_1 OR
    auth.uid() = user_id_2 OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent')
  );

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (
    auth.uid() = user_id_1 OR
    auth.uid() = user_id_2 OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent')
  );

-- 6. Create book_collections table
CREATE TABLE book_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL CHECK (language IN ('dutch', 'swedish', 'english', 'all')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE book_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections are viewable by everyone" ON book_collections
  FOR SELECT USING (true);

CREATE POLICY "Parents can manage collections" ON book_collections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent')
  );

-- 7. Create collection_books table
CREATE TABLE collection_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES book_collections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  year_published INTEGER,
  description TEXT,
  total_pages INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE collection_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection books are viewable by everyone" ON collection_books
  FOR SELECT USING (true);

CREATE POLICY "Parents can manage collection books" ON collection_books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'parent')
  );

CREATE INDEX idx_collection_books_collection_id ON collection_books(collection_id);

-- 8. Add foreign key constraint for currently_reading_book_id
ALTER TABLE profiles
  ADD CONSTRAINT fk_currently_reading
  FOREIGN KEY (currently_reading_book_id)
  REFERENCES books(id)
  ON DELETE SET NULL;

-- 9. Create function to update book updated_at timestamp
CREATE OR REPLACE FUNCTION update_book_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_book_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_book_updated_at();

-- 10. Sample data: Create book collections
INSERT INTO book_collections (name, description, language) VALUES
  ('De Gouden Griffel', 'Award-winning Dutch children''s books', 'dutch'),
  ('Swedish Classics', 'Classic Swedish children''s literature', 'swedish');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'BookQuest database schema created successfully!';
END $$;
