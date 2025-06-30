
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';
import { DemandMatrixOrchestrator } from './demand/demandMatrixOrchestrator';
import { DemandMatrixCacheService } from './demand/demandMatrixCacheService';
import { DemandMatrixValidationService } from './demand/demandMatrixValidationService';

/**
 * Demand Matrix Service - Refactored Public API
 * 
 * This service now delegates to focused services for better maintainability:
 * - DemandMatrixOrchestrator: Coordination and business logic
 * - DemandMatrixCacheService: Caching operations
 * - DemandMatrixValidationService: Validation logic
 */
export class DemandMatrixService {
  /**
   * Generate demand matrix forecast with optional filters
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    activeFilters?: {
      preferredStaff?: (string | number | null | undefined)[];
      skills?: string[];
      clients?: string[];
    }
  ): Promise<{ matrixData: DemandMatrixData }> {
    return DemandMatrixOrchestrator.generateDemandMatrix(mode, activeFilters);
  }

  /**
   * Validate demand matrix data
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    return DemandMatrixValidationService.validateDemandMatrixData(matrixData);
  }

  /**
   * Get demand matrix cache key
   */
  static getDemandMatrixCacheKey(mode: DemandMatrixMode, startDate: Date): string {
    return DemandMatrixCacheService.getDemandMatrixCacheKey(mode, startDate);
  }

  /**
   * Clear demand matrix cache
   */
  static clearCache(): void {
    DemandMatrixCacheService.clearCache();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return DemandMatrixCacheService.getCacheStats();
  }
}
