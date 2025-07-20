
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swuqsvwhfqqgkomjibzi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dXFzdndoZnFxZ2tvbWppYnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTA4NTYsImV4cCI6MjA2Mjg4Njg1Nn0.BKGRaCiPpZR7F6hD5XL8pYLPsWwXmBgerWN9w0jT7D8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
