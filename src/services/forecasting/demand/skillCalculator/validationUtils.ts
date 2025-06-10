
import { RecurringTaskDB, SkillType } from '@/types/task';
import { SkillHours } from '@/types/forecasting';

/**
 * Validation utilities for skill calculator inputs
 */
export class SkillValidationUtils {
  /**
   * Validate skill calculator inputs
   */
  static validateInputs(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate tasks parameter
    if (!Array.isArray(tasks)) {
      errors.push(`Tasks parameter is not an array: ${typeof tasks}`);
    }

    // Validate date range
    if (!monthStart || !monthEnd || monthEnd <= monthStart) {
      errors.push(`Invalid date range: ${monthStart} - ${monthEnd}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate skill hours array for aggregation
   */
  static validateSkillHoursArray(skillHoursArray: SkillHours[][]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(skillHoursArray) || skillHoursArray.length === 0) {
      errors.push('SkillHours array is empty or not an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate individual skill hour entry
   */
  static validateSkillHourEntry(skillHour: any): boolean {
    return skillHour && 
           typeof skillHour.skill === 'string' && 
           typeof skillHour.hours === 'number';
  }

  /**
   * Validate skill ID format
   */
  static validateSkillId(skillId: any): boolean {
    return typeof skillId === 'string' && skillId.trim().length > 0;
  }
}
