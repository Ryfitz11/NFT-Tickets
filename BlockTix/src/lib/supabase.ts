import { createClient } from '@supabase/supabase-js';

// Ensure URLs are properly formatted
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseKey || !isValidUrl(supabaseUrl)) {
  console.warn('Invalid or missing Supabase credentials. Image upload functionality will be disabled.');
}

export const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseConfigured = () => {
  return !!supabase;
};