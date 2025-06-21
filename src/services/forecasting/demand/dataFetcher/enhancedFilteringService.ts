
/**
 * Phase 3: Enhanced Filtering Service
 * 
 * Provides advanced filtering capabilities with skill resolution integration,
 * backward compatibility, and performance optimizations for large datasets.
 */

import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { SkillResolutionService } from '../skillResolution/skillResolutionService';

export interface EnhancedFilterOptions {
  skills?: SkillType[];
  clients?: string[];
  preferredStaff?: string[];
  preferredStaffMode?: 'all' | 'specific' | 'none';
  enablePerformanceOptimization?: boolean;
  validateSkillResolution?: boolean;
}

export interface FilterValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  skillResolutionStatus: {
    resolved: number;
    failed: number;
    cached: number;
  };
}

export class EnhancedFilteringService {
  /**
   * Phase 3: Validate filter compatibility and skill resolution
   */
  static async validateFilterOptions(options: EnhancedFilterOptions): Promise<FilterValidationResult> {
    console.log('🔍 [PHASE 3 FILTERING SERVICE] Validating filter options:', options);

    const result: FilterValidationResult = {
      isValid: true,
      issues: [],
      warnings: [],
      skillResolutionStatus: {
        resolved: 0,
        failed: 0,
        cached: 0
      }
    };

    try {
      // Phase 3: Validate skill resolution if skills are provided
      if (options.skills && options.skills.length > 0 && options.validateSkillResolution) {
        await SkillResolutionService.initializeSkillCache();
        
        const skillValidation = await SkillResolutionService.validateSkillReferences(options.skills);
        
        result.skillResolutionStatus = {
          resolved: skillValidation.resolved.length,
          failed: skillValidation.invalid.length,
          cached: skillValidation.valid.length
        };

        if (skillValidation.invalid.length > 0) {
          result.warnings.push(`Some skills could not be resolved: ${skillValidation.invalid.slice(0, 3).join(', ')}`);
        }

        console.log('✅ [PHASE 3 FILTERING SERVICE] Skill validation complete:', result.skillResolutionStatus);
      }

      // Phase 3: Validate preferred staff filter mode consistency
      if (options.preferredStaffMode === 'specific' && (!options.preferredStaff || options.preferredStaff.length === 0)) {
        result.warnings.push('Specific preferred staff mode selected but no staff specified - will show no results');
      }

      // Phase 3: Performance optimization warnings
      if (options.enablePerformanceOptimization) {
        if (options.skills && options.skills.length > 50) {
          result.warnings.push('Large skill filter set may impact performance');
        }
        if (options.clients && options.clients.length > 100) {
          result.warnings.push('Large client filter set may impact performance');
        }
      }

    } catch (error) {
      console.error('❌ [PHASE 3 FILTERING SERVICE] Validation error:', error);
      result.isValid = false;
      result.issues.push(`Filter validation failed: ${error}`);
    }

    console.log('📊 [PHASE 3 FILTERING SERVICE] Validation result:', result);
    return result;
  }

  /**
   * Phase 3: Enhanced skill normalization for filtering
   */
  static async normalizeSkillsForFiltering(skills: SkillType[]): Promise<{
    normalizedSkills: SkillType[];
    resolutionReport: any;
  }> {
    console.log('🔄 [PHASE 3 FILTERING SERVICE] Normalizing skills for filtering:', skills.slice(0, 5));

    try {
      // Initialize skill resolution service
      await SkillResolutionService.initializeSkillCache();
      
      // Validate and resolve skill references
      const resolutionReport = await SkillResolutionService.validateSkillReferences(skills);
      
      // Return resolved skill names for consistent filtering
      const normalizedSkills = resolutionReport.resolved.length > 0 
        ? resolutionReport.resolved 
        : skills;

      console.log('✅ [PHASE 3 FILTERING SERVICE] Skill normalization complete:', {
        originalCount: skills.length,
        normalizedCount: normalizedSkills.length,
        resolutionSuccess: resolutionReport.isValid
      });

      return {
        normalizedSkills,
        resolutionReport
      };

    } catch (error) {
      console.error('❌ [PHASE 3 FILTERING SERVICE] Skill normalization error:', error);
      
      // Fallback to original skills on error
      return {
        normalizedSkills: skills,
        resolutionReport: {
          isValid: false,
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Phase 3: Enhanced filter performance optimization
   */
  static optimizeFiltersForPerformance(
    demandData: DemandMatrixData,
    options: EnhancedFilterOptions
  ): EnhancedFilterOptions {
    console.log('⚡ [PHASE 3 FILTERING SERVICE] Optimizing filters for performance');

    const optimizedOptions = { ...options };

    // Phase 3: Optimize skill filters based on data size
    if (demandData.dataPoints.length > 1000) {
      optimizedOptions.enablePerformanceOptimization = true;
      
      // Limit skill filter size for very large datasets
      if (options.skills && options.skills.length > 100) {
        console.log('⚡ [PHASE 3 FILTERING SERVICE] Limiting skill filter size for performance');
        optimizedOptions.skills = options.skills.slice(0, 100);
      }
    }

    console.log('⚡ [PHASE 3 FILTERING SERVICE] Performance optimization complete');
    return optimizedOptions;
  }

  /**
   * Phase 3: Generate filter summary for diagnostics
   */
  static generateFilterSummary(options: EnhancedFilterOptions): {
    activeFilters: string[];
    filterCount: number;
    complexity: 'low' | 'medium' | 'high';
  } {
    const activeFilters: string[] = [];
    let filterCount = 0;

    if (options.skills && options.skills.length > 0) {
      activeFilters.push(`Skills (${options.skills.length})`);
      filterCount += options.skills.length;
    }

    if (options.clients && options.clients.length > 0) {
      activeFilters.push(`Clients (${options.clients.length})`);
      filterCount += options.clients.length;
    }

    if (options.preferredStaff && options.preferredStaff.length > 0) {
      activeFilters.push(`Preferred Staff (${options.preferredStaff.length})`);
      filterCount += options.preferredStaff.length;
    }

    if (options.preferredStaffMode && options.preferredStaffMode !== 'all') {
      activeFilters.push(`Staff Mode (${options.preferredStaffMode})`);
    }

    // Determine complexity based on filter count and types
    let complexity: 'low' | 'medium' | 'high';
    if (filterCount === 0) {
      complexity = 'low';
    } else if (filterCount < 10 && activeFilters.length <= 2) {
      complexity = 'low';
    } else if (filterCount < 50 && activeFilters.length <= 3) {
      complexity = 'medium';
    } else {
      complexity = 'high';
    }

    return {
      activeFilters,
      filterCount,
      complexity
    };
  }
}
