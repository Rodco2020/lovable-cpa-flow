
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
      skills: [],
      clients: [],
      timeHorizon: filters?.timeHorizon || {
        start: new Date(),
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      preferredStaff: filters?.preferredStaff || { staffIds: [] }
    };

    // Validate skills filter
    if (filters?.skills) {
      if (Array.isArray(filters.skills)) {
        processedFilters.skills = filters.skills.filter(skill => 
          skill && typeof skill === 'string' && skill.trim().length > 0
        );
        console.log(`✅ [FILTER PROCESSOR] Processed ${processedFilters.skills.length} skill filters`);
      } else {
        issues.push('Skills filter must be an array');
      }
    }

    // Validate clients filter
    if (filters?.clients) {
      if (Array.isArray(filters.clients)) {
        processedFilters.clients = filters.clients.filter(client => 
          client && typeof client === 'string' && client.trim().length > 0
        );
        console.log(`✅ [FILTER PROCESSOR] Processed ${processedFilters.clients.length} client filters`);
      } else {
        issues.push('Clients filter must be an array');
      }
    }

    // Validate preferred staff filter
    if (filters?.preferredStaff?.staffIds) {
      if (Array.isArray(filters.preferredStaff.staffIds)) {
        processedFilters.preferredStaff!.staffIds = filters.preferredStaff.staffIds.filter(staffId => 
          staffId && typeof staffId === 'string' && staffId.trim().length > 0
        );
        console.log(`✅ [FILTER PROCESSOR] Processed ${processedFilters.preferredStaff!.staffIds.length} preferred staff filters`);
      } else {
        issues.push('Preferred staff filter must be an array');
      }
    }

    // Validate time horizon
    if (filters?.timeHorizon) {
      if (!(filters.timeHorizon.start instanceof Date) || !(filters.timeHorizon.end instanceof Date)) {
        issues.push('Time horizon must contain valid Date objects');
      } else if (filters.timeHorizon.start >= filters.timeHorizon.end) {
        issues.push('Time horizon start date must be before end date');
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

    const hasSkills = filters.skills && filters.skills.length > 0;
    const hasClients = filters.clients && filters.clients.length > 0;
    const hasPreferredStaff = filters.preferredStaff?.staffIds && filters.preferredStaff.staffIds.length > 0;

    return !hasSkills && !hasClients && !hasPreferredStaff;
  }
}
