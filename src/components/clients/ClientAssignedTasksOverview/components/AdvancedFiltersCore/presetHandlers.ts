
import { AdvancedFilterState } from './types';

/**
 * Preset Handlers
 * Handles the logic for applying quick filter presets
 */
export class PresetHandlers {
  /**
   * Apply a preset filter configuration
   */
  static applyPreset(presetId: string, currentFilters: AdvancedFilterState): AdvancedFilterState {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (presetId) {
      case 'high-priority':
        return {
          ...currentFilters,
          priorityFilters: ['High'],
          preset: presetId
        };
      case 'this-month':
        return {
          ...currentFilters,
          dateRange: { from: firstDayOfMonth, to: lastDayOfMonth },
          preset: presetId
        };
      case 'recurring-only':
        return {
          ...currentFilters,
          statusFilters: ['Recurring'],
          preset: presetId
        };
      case 'multi-skill':
        return {
          ...currentFilters,
          preset: presetId
        };
      default:
        return currentFilters;
    }
  }
}
