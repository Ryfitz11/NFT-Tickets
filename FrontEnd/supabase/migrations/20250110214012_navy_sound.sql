/*
  # Update event metadata policies

  1. Changes
    - Drop existing policies
    - Create new public policies for both read and write access
  
  2. Security
    - Enable public read access to all event metadata
    - Enable public write access for event metadata creation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Event metadata is publicly readable" ON event_metadata;
DROP POLICY IF EXISTS "Users can insert their own event metadata" ON event_metadata;
DROP POLICY IF EXISTS "Anyone can insert event metadata" ON event_metadata;

-- Create new policies
CREATE POLICY "Public read access"
  ON event_metadata
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public write access"
  ON event_metadata
  FOR INSERT
  TO public
  WITH CHECK (true);