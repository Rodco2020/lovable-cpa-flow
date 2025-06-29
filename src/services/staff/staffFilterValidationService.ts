
import { UuidResolutionService } from './uuidResolutionService';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  resolvedValues: string[];
}

/**
 * Validation service to ensure staff filtering uses proper UUIDs
 * This prevents components from accidentally using names instead of UUIDs
 */
export class StaffFilterValidationService {
  
  /**
   * Check if a value looks like a UUID
   */
  private static isUuid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Check if a value looks like a name (contains spaces, letters, etc.)
   */
  private static looksLikeName(value: string): boolean {
    // Contains spaces and letters, likely a name
    return /^[a-zA-Z\s\-\.]+$/.test(value) && value.includes(' ');
  }

  /**
   * Validate staff filter values and auto-resolve names to UUIDs
   */
  static async validateAndResolveStaffFilters(
    staffFilters: (string | number | null | undefined)[]
  ): Promise<ValidationResult> {
    console.log('🔍 [STAFF FILTER VALIDATION] Validating staff filters:', staffFilters);
    
    const result: ValidationResult = {
      isValid: true,
      issues: [],
      suggestions: [],
      resolvedValues: []
    };

    // Filter out invalid values
    const validFilters = staffFilters
      .filter(filter => filter && typeof filter === 'string' && filter.trim().length > 0)
      .map(filter => (filter as string).trim());

    if (validFilters.length === 0) {
      result.issues.push('No valid staff filters provided');
      return result;
    }

    const uuidFilters: string[] = [];
    const nameFilters: string[] = [];

    // Classify filters as UUIDs or names
    for (const filter of validFilters) {
      if (this.isUuid(filter)) {
        uuidFilters.push(filter);
      } else if (this.looksLikeName(filter)) {
        nameFilters.push(filter);
        result.issues.push(`Filter "${filter}" appears to be a name instead of UUID`);
        result.suggestions.push(`Consider resolving "${filter}" to its UUID for better performance`);
      } else {
        result.issues.push(`Filter "${filter}" is neither a valid UUID nor a recognizable name`);
      }
    }

    // Resolve names to UUIDs
    let resolvedUuids: string[] = [];
    if (nameFilters.length > 0) {
      console.log('🔄 [STAFF FILTER VALIDATION] Resolving names to UUIDs:', nameFilters);
      resolvedUuids = await UuidResolutionService.resolveStaffNamesToUuids(nameFilters);
      
      if (resolvedUuids.length !== nameFilters.length) {
        result.isValid = false;
        result.issues.push(`Could not resolve all names to UUIDs: ${nameFilters.length - resolvedUuids.length} unresolved`);
      }
    }

    // Combine UUID filters with resolved UUIDs
    result.resolvedValues = [...uuidFilters, ...resolvedUuids];

    // Validate that all UUIDs exist in the database
    const allStaff = await UuidResolutionService.getAllStaff();
    const staffUuids = new Set(allStaff.map(staff => staff.id));
    
    const invalidUuids = result.resolvedValues.filter(uuid => !staffUuids.has(uuid));
    if (invalidUuids.length > 0) {
      result.isValid = false;
      result.issues.push(`Invalid staff UUIDs: ${invalidUuids.join(', ')}`);
    }

    console.log('✅ [STAFF FILTER VALIDATION] Validation complete:', {
      originalFilters: staffFilters,
      resolvedUuids: result.resolvedValues,
      isValid: result.isValid,
      issuesCount: result.issues.length
    });

    return result;
  }

  /**
   * Quick validation for development/debugging
   */
  static async quickValidate(staffFilters: (string | number | null | undefined)[]): Promise<boolean> {
    const result = await this.validateAndResolveStaffFilters(staffFilters);
    return result.isValid;
  }

  /**
   * Get staff display names for UUIDs (for debugging/logging)
   */
  static async getDisplayNamesForUuids(uuids: string[]): Promise<Record<string, string>> {
    const allStaff = await UuidResolutionService.getAllStaff();
    const displayNames: Record<string, string> = {};
    
    for (const uuid of uuids) {
      const staff = allStaff.find(s => s.id === uuid);
      displayNames[uuid] = staff ? staff.full_name : 'Unknown Staff';
    }
    
    return displayNames;
  }
}
