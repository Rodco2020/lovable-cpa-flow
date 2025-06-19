
/**
 * Debug utilities for client task operations
 * 
 * Provides enhanced logging and debugging capabilities for troubleshooting
 * RLS policy issues and authentication state problems.
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Enhanced authentication and RLS debugging utility
 */
export const debugAuthAndRLS = async (context: string = 'Unknown') => {
  try {
    console.log(`🔍 [DebugAuth] Starting auth/RLS debug for context: ${context}`);
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log(`📋 [DebugAuth][${context}] Session state:`, {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
      role: session?.user?.role,
      expiresAt: session?.expires_at,
      sessionError,
      timestamp: new Date().toISOString()
    });

    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log(`👤 [DebugAuth][${context}] User state:`, {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      userRole: user?.role,
      userError,
      timestamp: new Date().toISOString()
    });

    // Test RLS access with a simple query
    try {
      const { data: testData, error: testError } = await supabase
        .from('recurring_tasks')
        .select('id')
        .limit(1);
        
      console.log(`🔒 [DebugAuth][${context}] RLS test query:`, {
        canAccessRecurringTasks: !testError,
        testError: testError?.message,
        testData: testData?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (rlsError) {
      console.error(`❌ [DebugAuth][${context}] RLS test failed:`, rlsError);
    }

    // Check staff table access (used in RLS policy)
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, email, status')
        .limit(1);
        
      console.log(`👥 [DebugAuth][${context}] Staff table access:`, {
        canAccessStaff: !staffError,
        staffError: staffError?.message,
        staffCount: staffData?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (staffAccessError) {
      console.error(`❌ [DebugAuth][${context}] Staff access failed:`, staffAccessError);
    }

    return {
      hasValidSession: !!session && !sessionError,
      hasValidUser: !!user && !userError,
      canAccessRecurringTasks: true // Will be determined by the actual operations
    };
  } catch (error) {
    console.error(`💥 [DebugAuth][${context}] Debug process failed:`, error);
    return {
      hasValidSession: false,
      hasValidUser: false,
      canAccessRecurringTasks: false
    };
  }
};

/**
 * Enhanced operation logging with RLS context
 */
export const logOperationWithRLSContext = async (
  operation: string,
  context: any,
  beforeCallback?: () => Promise<void>
) => {
  console.log(`🚀 [OperationLog] Starting ${operation}:`, {
    operation,
    context,
    timestamp: new Date().toISOString()
  });

  // Run auth/RLS debug before the operation
  await debugAuthAndRLS(`${operation}_before`);
  
  // Execute any pre-operation callback
  if (beforeCallback) {
    await beforeCallback();
  }
};
