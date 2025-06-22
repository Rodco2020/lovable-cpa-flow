
// Staff Services Exports
export { StaffService } from './staffService';
export { 
  getActiveStaffForDropdown, 
  validateStaffId 
} from './staffDropdownService';
export type { StaffOption } from '@/types/staffOption';

// Remove duplicate getStaffById export to resolve ambiguity
// The getStaffById from staffDropdownService will be used
