/*
  # Create event metadata table

  1. New Tables
    - `event_metadata`
      - `id` (uuid, primary key)
      - `event_address` (text, unique)
      - `image_url` (text)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `event_metadata` table
    - Add policy for public read access
    - Add policy for authenticated users to insert their own metadata
*/

CREATE TABLE IF NOT EXISTS event_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_address text UNIQUE NOT NULL,
  image_url text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_metadata ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read event metadata
CREATE POLICY "Event metadata is publicly readable"
  ON event_metadata
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert event metadata
CREATE POLICY "Users can insert their own event metadata"
  ON event_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);