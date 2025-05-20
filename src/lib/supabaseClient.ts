
// This file is now just a re-export of the official Supabase client
// to maintain compatibility with existing imports while ensuring
// a single source of client configuration.
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';

export { supabase, checkSupabaseConnection };

// Export a function to check if Supabase is properly connected
export const isSupabaseConnected = async () => {
  return await checkSupabaseConnection();
};
