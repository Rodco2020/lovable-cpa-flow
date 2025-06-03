
import { AdvancedFilterState } from './types';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';

/**
 * Utility functions for Advanced Filters
 */
export class AdvancedFiltersUtils {
  /**
   * Validate and filter clients to ensure they have required properties
   */
  static validateClients(clients: Client[]): Client[] {
    if (!Array.isArray(clients)) return [];
    return clients.filter(client => 
      client && 
      typeof client === 'object' && 
      client.id && 
      typeof client.id === 'string' && 
      client.id.trim() !== '' &&
      client.legalName &&
      typeof client.legalName === 'string' &&
      client.legalName.trim() !== ''
    );
  }

  /**
   * Validate and filter skills to ensure they are valid strings
   */
  static validateSkills(availableSkills: string[]): string[] {
    if (!Array.isArray(availableSkills)) return [];
    
    const filtered = availableSkills.filter(skill => 
      skill && 
      typeof skill === 'string' && 
      skill.trim() !== ''
    );
    
    // Use Set for additional deduplication safety
    const deduplicated = [...new Set(filtered)];
    
    console.log('[AdvancedFiltersUtils] Skill validation:', {
      original: availableSkills.length,
      afterFiltering: filtered.length,
      afterDeduplication: deduplicated.length,
      duplicatesRemoved: filtered.length - deduplicated.length
    });
    
    return deduplicated.sort();
  }

  /**
   * Validate and filter priorities
   */
  static validatePriorities(availablePriorities: string[]): string[] {
    if (!Array.isArray(availablePriorities)) return [];
    return availablePriorities.filter(priority => 
      priority && 
      typeof priority === 'string' && 
      priority.trim() !== ''
    );
  }

  /**
   * Validate and filter staff options
   */
  static validateStaffOptions(staffOptions: StaffOption[]): StaffOption[] {
    if (!Array.isArray(staffOptions)) return [];
    return staffOptions.filter(staff => 
      staff && 
      typeof staff === 'object' && 
      staff.id && 
      typeof staff.id === 'string' && 
      staff.id.trim() !== '' &&
      staff.full_name &&
      typeof staff.full_name === 'string' &&
      staff.full_name.trim() !== ''
    );
  }

  /**
   * Count active filters
   */
  static getActiveFilterCount(filters: AdvancedFilterState): number {
    return filters.skillFilters.length + 
           filters.clientFilters.length + 
           filters.priorityFilters.length + 
           filters.statusFilters.length +
           filters.staffLiaisonFilters.length +
           (filters.dateRange.from || filters.dateRange.to ? 1 : 0);
  }

  /**
   * Clear all filters
   */
  static getClearedFilters(): AdvancedFilterState {
    return {
      skillFilters: [],
      clientFilters: [],
      priorityFilters: [],
      statusFilters: [],
      staffLiaisonFilters: [],
      dateRange: { from: undefined, to: undefined },
      preset: null
    };
  }
}
