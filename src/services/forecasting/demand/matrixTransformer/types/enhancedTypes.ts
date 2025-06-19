
import { TransformationInput } from './coreTypes';
import { StaffResolutionContext } from './preferredStaffTypes';

/**
 * Enhanced transformation input with all preferred staff data
 */
export interface EnhancedTransformationInput extends TransformationInput {
  staffMembers: Array<{
    id: string;
    full_name: string;
    role_title?: string;
    assigned_skills: string[];
    cost_per_hour?: number;
    status?: string;
  }>;
  preferredStaffResolutionContext: StaffResolutionContext;
}
