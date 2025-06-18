
import { supabase } from '@/lib/supabaseClient';

/**
 * Staff Validation Service for Client Task Operations
 * 
 * Provides validation functions to ensure staff IDs exist before database operations
 */

export interface StaffValidationResult {
  isValid: boolean;
  exists: boolean;
  staffName?: string;
  error?: string;
}

/**
 * Check if a staff member exists in the database
 */
export const validateStaffExists = async (staffId: string | null): Promise<StaffValidationResult> => {
  console.log('🔍 [validateStaffExists] PHASE 3 - Starting staff validation:', {
    staffId,
    staffIdType: typeof staffId,
    timestamp: new Date().toISOString()
  });

  // Handle null case - this is valid (no preference)
  if (staffId === null) {
    console.log('✅ [validateStaffExists] PHASE 3 - Null staff ID is valid (no preference)');
    return {
      isValid: true,
      exists: true // null is considered "existing" in our context
    };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(staffId)) {
    console.error('❌ [validateStaffExists] PHASE 3 - Invalid UUID format:', {
      staffId,
      timestamp: new Date().toISOString()
    });
    return {
      isValid: false,
      exists: false,
      error: `Invalid staff ID format: ${staffId}`
    };
  }

  try {
    console.log('📡 [validateStaffExists] PHASE 3 - Querying database for staff:', {
      staffId,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, status')
      .eq('id', staffId)
      .maybeSingle();

    if (error) {
      console.error('💥 [validateStaffExists] PHASE 3 - Database query failed:', {
        staffId,
        error,
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        exists: false,
        error: `Database error: ${error.message}`
      };
    }

    if (!data) {
      console.warn('⚠️ [validateStaffExists] PHASE 3 - Staff not found:', {
        staffId,
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        exists: false,
        error: `Staff member with ID ${staffId} not found`
      };
    }

    // Check if staff is active
    if (data.status !== 'active') {
      console.warn('⚠️ [validateStaffExists] PHASE 3 - Staff is inactive:', {
        staffId,
        status: data.status,
        staffName: data.full_name,
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        exists: true,
        staffName: data.full_name,
        error: `Staff member ${data.full_name} is not active (status: ${data.status})`
      };
    }

    console.log('✅ [validateStaffExists] PHASE 3 - Staff validation successful:', {
      staffId,
      staffName: data.full_name,
      status: data.status,
      timestamp: new Date().toISOString()
    });

    return {
      isValid: true,
      exists: true,
      staffName: data.full_name
    };
  } catch (error) {
    console.error('💥 [validateStaffExists] PHASE 3 - Unexpected error:', {
      staffId,
      error,
      timestamp: new Date().toISOString()
    });
    return {
      isValid: false,
      exists: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Batch validate multiple staff IDs
 */
export const validateMultipleStaff = async (staffIds: (string | null)[]): Promise<Map<string | null, StaffValidationResult>> => {
  console.log('🔍 [validateMultipleStaff] PHASE 3 - Starting batch validation:', {
    staffIds,
    count: staffIds.length,
    timestamp: new Date().toISOString()
  });

  const results = new Map<string | null, StaffValidationResult>();
  
  // Process each staff ID
  for (const staffId of staffIds) {
    const result = await validateStaffExists(staffId);
    results.set(staffId, result);
  }

  console.log('✅ [validateMultipleStaff] PHASE 3 - Batch validation completed:', {
    totalProcessed: results.size,
    validCount: Array.from(results.values()).filter(r => r.isValid).length,
    timestamp: new Date().toISOString()
  });

  return results;
};
