
// Staff Services Exports
export { StaffService } from './staffService';
export { 
  getActiveStaffForDropdown, 
  validateStaffId,
  getStaffById as getStaffByIdFromDropdown
} from './staffDropdownService';

// Core staff operations - export all functions from staffService
export {
  getAllStaff,
  getActiveStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from './staffService';

// Staff availability operations - these need to be implemented
export {
  getWeeklyAvailabilityByStaff,
  batchUpdateWeeklyAvailability,
  calculateAvailabilitySummary,
  ensureStaffHasAvailability,
  getTimeSlotsByStaffAndDate,
  getTimeSlotsByDate,
  updateTimeSlot,
  mapStaffSkillsToForecastSkills
} from './staffAvailabilityService';

export type { StaffOption } from '@/types/staffOption';
