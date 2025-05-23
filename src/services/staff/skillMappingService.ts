
import { SkillType } from "@/types/task";
import { getStaffById } from "./staffService";
import { normalizeSkills } from "../skillNormalizationService";

/**
 * Functions for mapping and normalizing staff skills
 */

/**
 * Map a staff member's skills to standardized forecast skill types
 * @param staffId The UUID of the staff member
 * @returns Promise resolving to an array of normalized skill types
 */
export const mapStaffSkillsToForecastSkills = async (staffId: string) => {
  const staff = await getStaffById(staffId);
  
  if (!staff) {
    console.error(`Staff member ${staffId} not found`);
    return [];
  }
  
  // Use the centralized skill normalization service with staff ID overrides
  return normalizeSkills(staff.skills, staff.id) as SkillType[];
};
