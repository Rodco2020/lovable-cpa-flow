
import { SkillType } from '@/types/task';
import { ForecastData } from '@/types/forecasting';
import { debugLog } from '../logger';

/**
 * Matrix Forecast Validators
 * Handles validation logic for forecast generation
 */
export class MatrixForecastValidators {
  /**
   * Validates if skills are available for forecast generation
   */
  static validateSkillsAvailability(skills: SkillType[]): boolean {
    const isValid = skills.length > 0;
    
    if (!isValid) {
      debugLog('Validation failed: No database skills available for forecast generation');
    }
    
    return isValid;
  }

  /**
   * Validates forecast data integrity
   */
  static validateForecastData(data: ForecastData[]): boolean {
    if (!data || data.length === 0) {
      debugLog('Validation warning: Empty forecast data array');
      return false;
    }

    const hasValidPeriods = data.every(period => 
      period.period && 
      Array.isArray(period.demand) && 
      Array.isArray(period.capacity)
    );

    if (!hasValidPeriods) {
      debugLog('Validation failed: Invalid forecast data structure');
      return false;
    }

    return true;
  }

  /**
   * Validates client filtering options
   */
  static validateClientOptions(clientIds?: string[]): boolean {
    if (clientIds && !Array.isArray(clientIds)) {
      debugLog('Validation failed: clientIds must be an array');
      return false;
    }

    return true;
  }
}
