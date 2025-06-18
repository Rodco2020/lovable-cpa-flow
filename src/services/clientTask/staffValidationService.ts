
/**
 * Staff Validation Service
 * 
 * Provides validation utilities for staff-related operations in client tasks.
 * Ensures data integrity and provides detailed validation feedback.
 * 
 * @module StaffValidationService
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Result of staff validation operation
 */
export interface StaffValidationResult {
  /** Whether staff member is valid (exists and is active) */
  isValid: boolean;
  /** Whether staff member exists in database */
  exists: boolean;
  /** Whether staff member is active (if exists) */
  isActive?: boolean;
  /** Display name of staff member (if exists) */
  staffName?: string;
}

/**
 * Validates that a specific staff member exists and is active
 * 
 * Performs comprehensive validation including existence check,
 * status verification, and returns detailed feedback for error handling.
 * 
 * @param staffId - UUID of staff member to validate
 * @returns Promise<StaffValidationResult> Detailed validation result
 * 
 * @example
 * ```typescript
 * const result = await validateStaffExists('staff-uuid');
 * if (result.isValid) {
 *   // Staff member is active and can be assigned
 * } else if (!result.exists) {
 *   // Staff member doesn't exist
 * } else {
 *   // Staff member exists but is inactive
 * }
 * ```
 */
export const validateStaffExists = async (staffId: string): Promise<StaffValidationResult> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, status')
      .eq('id', staffId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error during staff validation: ${error.message}`);
    }

    if (!data) {
      return {
        isValid: false,
        exists: false
      };
    }

    const isActive = data.status === 'active';
    
    return {
      isValid: isActive,
      exists: true,
      isActive,
      staffName: data.full_name
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to validate staff existence: ${errorMessage}`);
  }
};

/**
 * Validates multiple staff members in a single database operation
 * 
 * Efficiently validates multiple staff IDs while maintaining order
 * and providing detailed results for each staff member.
 * 
 * @param staffIds - Array of staff UUIDs to validate
 * @returns Promise<StaffValidationResult[]> Array of validation results in same order
 * 
 * @example
 * ```typescript
 * const results = await validateMultipleStaff(['staff-1', 'staff-2']);
 * const validStaff = results.filter(r => r.isValid);
 * const invalidStaff = results.filter(r => !r.isValid);
 * ```
 */
export const validateMultipleStaff = async (staffIds: string[]): Promise<StaffValidationResult[]> => {
  if (staffIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, status')
      .in('id', staffIds);

    if (error) {
      throw new Error(`Database error during bulk staff validation: ${error.message}`);
    }

    // Create a map for efficient lookups
    const staffMap = new Map(data?.map(staff => [staff.id, staff]) || []);

    // Return results in the same order as input
    return staffIds.map(staffId => {
      const staff = staffMap.get(staffId);
      
      if (!staff) {
        return {
          isValid: false,
          exists: false
        };
      }

      const isActive = staff.status === 'active';
      
      return {
        isValid: isActive,
        exists: true,
        isActive,
        staffName: staff.full_name
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to validate multiple staff members: ${errorMessage}`);
  }
};
