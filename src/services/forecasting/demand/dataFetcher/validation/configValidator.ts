
/**
 * Configuration Validator Service
 * 
 * Validates filter configurations and provides recommendations
 */

export interface FilterConfigValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}

export class ConfigValidator {
  /**
   * Validate filter configuration
   */
  static validateFilterConfiguration(config: {
    preferredStaffFilterMode: string;
    selectedPreferredStaff: string[];
  }): FilterConfigValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const validModes = ['all', 'specific', 'none'];
    if (!validModes.includes(config.preferredStaffFilterMode)) {
      issues.push(`Invalid preferred staff filter mode: ${config.preferredStaffFilterMode}`);
    }

    if (config.preferredStaffFilterMode === 'specific' && config.selectedPreferredStaff.length === 0) {
      recommendations.push('Specific mode selected but no staff chosen - this will show no results');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}
