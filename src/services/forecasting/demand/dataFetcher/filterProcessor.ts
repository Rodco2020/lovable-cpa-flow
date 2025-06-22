
/**
 * Filter Processor
 * Handles validation and processing of demand filters
 */

import { DemandFilters } from '@/types/demand';
import { FilterValidationResult } from './types';

export class FilterProcessor {
  /**
   * Validate and process demand filters
   */
  static validateAndProcessFilters(filters?: DemandFilters): FilterValidationResult {
    console.log('🔍 [FILTER PROCESSOR] Validating filters:', filters);

    const issues: string[] = [];
    const processedFilters: DemandFilters = {
      skillTypes: [],
      clientIds: [],
      dateRange: filters?.dateRange || {
        start: new Date(),
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      preferredStaffIds: filters?.preferredStaffIds || []
    };

    // Validate skills filter
    if (filters?.skillTypes) {
      if (Array.isArray(filters.skillTypes)) {
        processedFilters.skillTypes = filters.skillTypes.filter(skill => 
          skill && typeof skill === 'string' && skill.trim().length > 0
        );
        console.log(`✅ [FILTER PROCESSOR] Processed ${processedFilters.skillTypes.length} skill filters`);
      } else {
        issues.push('Skills filter must be an array');
      }
    }

    // Validate clients filter
    if (filters?.clientIds) {
      if (Array.isArray(filters.clientIds)) {
        processedFilters.clientIds = filters.clientIds.filter(client => 
          client && typeof client === 'string' && client.trim().length > 0
        );
        console.log(`✅ [FILTER PROCESSOR] Processed ${processedFilters.clientIds.length} client filters`);
      } else {
        issues.push('Clients filter must be an array');
      }
    }

    // Validate preferred staff filter
    if (filters?.preferredStaffIds) {
      if (Array.isArray(filters.preferredStaffIds)) {
        processedFilters.preferredStaffIds = filters.preferredStaffIds.filter(staffId => 
          staffId && typeof staffId === 'string' && staffId.trim().length > 0
        );
        console.log(`✅ [FILTER PROCESSOR] Processed ${processedFilters.preferredStaffIds.length} preferred staff filters`);
      } else {
        issues.push('Preferred staff filter must be an array');
      }
    }

    // Validate date range
    if (filters?.dateRange) {
      if (!(filters.dateRange.start instanceof Date) || !(filters.dateRange.end instanceof Date)) {
        issues.push('Date range must contain valid Date objects');
      } else if (filters.dateRange.start >= filters.dateRange.end) {
        issues.push('Date range start date must be before end date');
      }
    }

    const isValid = issues.length === 0;
    console.log(`📊 [FILTER PROCESSOR] Filter validation ${isValid ? 'passed' : 'failed'}:`, { issues });

    return {
      isValid,
      processedFilters,
      issues
    };
  }

  /**
   * Check if filters are effectively empty (no actual filtering)
   */
  static areFiltersEmpty(filters?: DemandFilters): boolean {
    if (!filters) return true;

    const hasSkills = filters.skillTypes && filters.skillTypes.length > 0;
    const hasClients = filters.clientIds && filters.clientIds.length > 0;
    const hasPreferredStaff = filters.preferredStaffIds && filters.preferredStaffIds.length > 0;

    return !hasSkills && !hasClients && !hasPreferredStaff;
  }
}
