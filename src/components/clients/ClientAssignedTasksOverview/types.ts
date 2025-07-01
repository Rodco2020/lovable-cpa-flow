
import { RecurrencePattern } from '@/types/task';

export interface FormattedTask {
  id: string;
  clientId: string;
  clientName: string;
  taskName: string;
  taskType: 'Ad-hoc' | 'Recurring';
  dueDate: Date | null;
  recurrencePattern?: RecurrencePattern;
  estimatedHours: number;
  requiredSkills: string[];
  priority: string;
  status: string;
  isActive?: boolean;
  staffLiaisonId?: string;
  staffLiaisonName?: string;
  // NEW: Add preferred staff fields
  preferredStaffId?: string;
  preferredStaffName?: string;
}

export interface FilterState {
  searchTerm: string;
  clientFilter: string;
  skillFilter: string;
  priorityFilter: string;
  statusFilter: string;
  // NEW: Add preferred staff filter
  preferredStaffFilter: string;
}
