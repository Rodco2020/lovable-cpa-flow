
import { SkillType } from '@/types/task';
import { isStaffIdInArray } from '@/utils/staffIdUtils';

export interface CalculatedValues {
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
}

export const calculateSelectionStates = (
  selectedSkills: SkillType[],
  selectedClients: string[],
  selectedPreferredStaff: string[],
  availableSkills: SkillType[],
  availableClients: Array<{ id: string; name: string }>,
  availablePreferredStaff: Array<{ id: string; name: string; roleTitle?: string }>
): CalculatedValues => {
  const isAllSkillsSelected = availableSkills.length > 0 && 
    selectedSkills.length === availableSkills.length &&
    availableSkills.every(skill => selectedSkills.includes(skill));

  const isAllClientsSelected = availableClients.length > 0 &&
    selectedClients.length === availableClients.length &&
    availableClients.every(client => selectedClients.includes(client.id));

  // PHASE 3 FIX: Enhanced preferred staff selection calculation with validation
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && 
    selectedPreferredStaff.length === availablePreferredStaff.length &&
    availablePreferredStaff.every(staff => 
      isStaffIdInArray(staff.id, selectedPreferredStaff)
    );

  return {
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected
  };
};
