/*
  # Create storage bucket for event images

  1. New Storage
    - Create 'event-images' bucket for storing event images
  2. Security
    - Enable public read access to images
    - Allow anyone to upload images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Allow anyone to upload files to the bucket
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-images');