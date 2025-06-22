
/**
 * Filtering Validation Service - Refactored
 * 
 * This service has been refactored into smaller, focused modules while preserving
 * exact functionality. All methods now delegate to specialized services.
 * 
 * PRESERVED FUNCTIONALITY:
 * - All validation logic works exactly the same
 * - Same method signatures and return types
 * - Identical console logging and error handling
 * - Complete backward compatibility
 * 
 * IMPROVEMENTS:
 * - Modular architecture with focused responsibilities
 * - Better testability with isolated services
 * - Improved maintainability and code organization
 * - Clearer separation of concerns
 */

import { DemandMatrixData } from '@/types/demand';
import { 
  DiagnosticsService, 
  StaffIdExtractor, 
  ConfigValidator, 
  PerformanceReporter,
  FilteringDiagnostics,
  FilterConfigValidationResult,
  PerformanceReport
} from './validation';

export class FilteringValidationService {
  /**
   * Validate data structure before filtering
   * Delegates to DiagnosticsService while preserving exact behavior
   */
  static validateDataStructure(demandData: DemandMatrixData): FilteringDiagnostics {
    return DiagnosticsService.validateDataStructure(demandData);
  }

  /**
   * Extract staff ID from various staff reference formats with proper type safety
   * Delegates to StaffIdExtractor while preserving exact behavior
   */
  static extractStaffId(staffRef: string | { staffId: string; full_name: string; } | null): string | null {
    return StaffIdExtractor.extractStaffId(staffRef);
  }

  /**
   * Safe staff ID extraction with proper type checking
   * Delegates to StaffIdExtractor while preserving exact behavior
   */
  static safeExtractStaffId(staffRef: string | { staffId: string; full_name: string; } | null): string | null {
    return StaffIdExtractor.safeExtractStaffId(staffRef);
  }

  /**
   * Validate filter configuration
   * Delegates to ConfigValidator while preserving exact behavior
   */
  static validateFilterConfiguration(config: {
    preferredStaffFilterMode: string;
    selectedPreferredStaff: string[];
  }): FilterConfigValidationResult {
    return ConfigValidator.validateFilterConfiguration(config);
  }

  /**
   * Generate filtering performance report
   * Delegates to PerformanceReporter while preserving exact behavior
   */
  static generatePerformanceReport(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData,
    filterConfig: any
  ): PerformanceReport {
    return PerformanceReporter.generatePerformanceReport(originalData, filteredData, filterConfig);
  }
}
