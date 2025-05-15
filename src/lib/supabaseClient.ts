
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have the required credentials
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

if (!hasSupabaseCredentials) {
  console.error('Missing Supabase credentials. Please connect to Supabase using the green Supabase button in the top right corner.');
}

// Create a mock client for development if credentials are missing
const createMockClient = () => {
  // Return an object with dummy methods that return promises to prevent runtime errors
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'No Supabase connection' } }),
        }),
        in: () => ({
          data: [],
          error: { message: 'No Supabase connection' }
        }),
        data: [],
        error: { message: 'No Supabase connection' }
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: 'No Supabase connection' } }),
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'No Supabase connection' } }),
          })
        })
      }),
      delete: () => ({
        eq: () => ({ error: { message: 'No Supabase connection' } })
      })
    })
  } as unknown as ReturnType<typeof createClient<Database>>;
};

// Create Supabase client or use mock if credentials are missing
export const supabase = hasSupabaseCredentials 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Export a function to check if Supabase is properly connected
export const isSupabaseConnected = () => hasSupabaseCredentials;
