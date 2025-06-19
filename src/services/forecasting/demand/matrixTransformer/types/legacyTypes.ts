
import { RecurringTaskDB } from '@/types/task';
import { TransformationInput, TransformationOptions } from './coreTypes';

/**
 * Legacy support and migration types
 */
export interface LegacyTransformationInput {
  tasks: RecurringTaskDB[];
  clients: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>;
  skills: string[];
  months: Array<{ key: string; label: string }>;
}

export interface LegacyTaskPeriodData {
  taskId: string;
  clientId: string;
  clientName: string;
  skillType: string;
  estimatedHours: number;
  monthlyHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
}

/**
 * Type guards and utility types
 */
export function hasPreferredStaffSupport(input: TransformationInput | LegacyTransformationInput): input is TransformationInput {
  return 'staffMembers' in input;
}

export function isPreferredStaffEnabled(options?: TransformationOptions): boolean {
  return options?.preferredStaffOptions?.enabled === true;
}
