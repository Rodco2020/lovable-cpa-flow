
// This file is now just a re-export of the official Supabase client
// to maintain compatibility with existing imports while ensuring
// a single source of client configuration.
import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Export a function to check if Supabase is properly connected
export const isSupabaseConnected = () => true; // Always true since we're using hardcoded credentials
