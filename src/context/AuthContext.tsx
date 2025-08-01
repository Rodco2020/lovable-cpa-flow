
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a version of AuthProvider that doesn't depend on useNavigate
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Thorough cleanup function for all Supabase auth tokens
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data fetching to prevent deadlocks
        if (session?.user) {
          setTimeout(() => {
            // Can add additional user data fetching here if needed
            checkAndCreateStaffRecord(session.user);
          }, 0);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAndCreateStaffRecord(session.user);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Helper function to check if a staff record exists for the user
  // and create one if it doesn't
  const checkAndCreateStaffRecord = async (user: User) => {
    try {
      // First check if staff record already exists
      const { data: existingStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      
      // If staff record doesn't exist, create one
      if (!existingStaff) {
        // Get user profile to get first/last name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
          
        const firstName = profile?.first_name || '';
        const lastName = profile?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'New Staff';
        
        // Create staff record - using correct column names that match our database schema
        await supabase.from('staff').insert({
          email: user.email,
          full_name: fullName,
          assigned_skills: [],
          status: 'active',
          cost_per_hour: 50.00
        });
        
        console.log('Created new staff record for user:', user.email);
      }
    } catch (error) {
      console.error('Error checking/creating staff record:', error);
      // Non-blocking - don't throw error so auth flow continues
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Signed in successfully');
        // Let the auth state change handler redirect
      }
    } catch (error: any) {
      toast.error(`Error signing in: ${error.message}`);
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Signup successful! Check your email for the confirmation link.');
    } catch (error: any) {
      toast.error(`Error signing up: ${error.message}`);
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success('Signed out successfully');
      
      // Force page reload for a clean state
      window.location.href = '/auth/login';
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
