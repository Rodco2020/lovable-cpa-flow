
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 [AuthProvider] Initializing auth state');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AuthProvider] Error getting initial session:', error);
        } else {
          console.log('📋 [AuthProvider] Initial session retrieved:', {
            hasSession: !!initialSession,
            hasUser: !!initialSession?.user,
            userEmail: initialSession?.user?.email,
            expiresAt: initialSession?.expires_at,
            timestamp: new Date().toISOString()
          });
          
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('💥 [AuthProvider] Unexpected error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AuthProvider] Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🧹 [AuthProvider] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔓 [AuthProvider] Initiating sign out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ [AuthProvider] Sign out error:', error);
        throw error;
      }
      console.log('✅ [AuthProvider] Sign out successful');
    } catch (error) {
      console.error('💥 [AuthProvider] Sign out failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut
  };

  console.log('🏗️ [AuthProvider] Rendering with state:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    isLoading,
    timestamp: new Date().toISOString()
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
