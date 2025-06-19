
import { debugLog } from '../../forecasting/logger';
import type { StaffInfo } from './cacheManager';

export interface StaffValidationResult {
  isValid: boolean;
  staffInfo?: StaffInfo;
  errors: string[];
  skillMatches?: {
    required: string[];
    available: string[];
    matched: string[];
    missing: string[];
  };
}

export interface StaffResolutionOptions {
  enableCaching?: boolean;
  cacheExpiry?: number;
  includeInactiveStaff?: boolean;
  validateSkillMatching?: boolean;
}

/**
 * Validation utilities for Staff Resolution Service
 * Handles all validation operations for staff data
 */
export class StaffValidator {
  /**
   * Validate staff ID format and type
   */
  static validateStaffId(staffId: string): boolean {
    return !!(staffId && typeof staffId === 'string');
  }

  /**
   * Validate staff IDs array
   */
  static validateStaffIds(staffIds: string[]): string[] {
    if (!Array.isArray(staffIds) || staffIds.length === 0) {
      debugLog('Invalid or empty staff IDs array provided');
      return [];
    }

    return staffIds.filter(id => this.validateStaffId(id));
  }

  /**
   * Validate staff assignment against required skills
   */
  static validateStaffAssignmentSkills(
    staffInfo: StaffInfo,
    requiredSkills: string[],
    options: StaffResolutionOptions = {}
  ): StaffValidationResult {
    const result: StaffValidationResult = {
      isValid: false,
      errors: [],
      staffInfo
    };

    // Validate skill matching if requested
    if (options.validateSkillMatching && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      const staffSkills = staffInfo.assignedSkills || [];
      const matched = requiredSkills.filter(skill => staffSkills.includes(skill));
      const missing = requiredSkills.filter(skill => !staffSkills.includes(skill));

      result.skillMatches = {
        required: requiredSkills,
        available: staffSkills,
        matched,
        missing
      };

      if (missing.length > 0) {
        result.errors.push(`Staff member ${staffInfo.name} is missing required skills: ${missing.join(', ')}`);
      }
    }

    // Check if staff is active
    if (staffInfo.status !== 'active' && !options.includeInactiveStaff) {
      result.errors.push(`Staff member ${staffInfo.name} is not active`);
    }

    result.isValid = result.errors.length === 0;

    debugLog('Staff validation completed', {
      staffId: staffInfo.id,
      staffName: staffInfo.name,
      isValid: result.isValid,
      errorCount: result.errors.length
    });

    return result;
  }

  /**
   * Transform database record to StaffInfo
   */
  static transformDatabaseRecord(data: any): StaffInfo {
    return {
      id: data.id,
      name: data.full_name,
      roleTitle: data.role_title || undefined,
      assignedSkills: Array.isArray(data.assigned_skills) ? data.assigned_skills : [],
      costPerHour: data.cost_per_hour ? Number(data.cost_per_hour) : undefined,
      status: data.status
    };
  }
}
