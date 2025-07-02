
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';

/**
 * Core types for Advanced Filters components
 */
export interface AdvancedFilterState {
  skillFilters: string[];
  clientFilters: string[];
  priorityFilters: string[];
  statusFilters: string[];
  staffLiaisonFilters: string[];
  preferredStaffFilters: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  preset: string | null;
}

export interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onFiltersChange: (filters: AdvancedFilterState) => void;
  clients: Client[];
  availableSkills: string[];
  availablePriorities: string[];
  staffOptions: StaffOption[];
  className?: string;
}

export interface QuickPreset {
  id: string;
  label: string;
  description: string;
}

export const QUICK_PRESETS: QuickPreset[] = [
  { id: 'high-priority', label: 'High Priority Tasks', description: 'Tasks with high priority' },
  { id: 'this-month', label: 'This Month', description: 'Tasks due this month' },
  { id: 'recurring-only', label: 'Recurring Tasks', description: 'Only recurring tasks' },
  { id: 'multi-skill', label: 'Multi-Skill Tasks', description: 'Tasks requiring multiple skills' }
];
