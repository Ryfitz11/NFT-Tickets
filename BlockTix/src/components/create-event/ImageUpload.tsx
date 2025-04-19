import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSupabaseConfigured()) {
      toast.error('Image upload is not available. Please try again later.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase!.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase!.storage
        .from('event-images')
        .getPublicUrl(filePath);

      // Update with the actual uploaded URL
      onChange(publicUrl);
      toast.success('Image uploaded successfully');

      // Clean up the temporary URL
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      // Reset the image if upload fails
      onChange('');
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Event Image
      </label>
      
      <div className="flex items-center space-x-4">
        {value ? (
          <div className="relative w-24 h-24">
            <img
              src={value}
              alt="Event preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div>
          <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!isSupabaseConfigured() ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={!isSupabaseConfigured()}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Max file size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
          {!isSupabaseConfigured() && (
            <p className="mt-1 text-xs text-red-500">
              Image upload is currently unavailable
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}