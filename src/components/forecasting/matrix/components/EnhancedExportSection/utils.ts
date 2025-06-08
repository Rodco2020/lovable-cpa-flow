
import { SkillType } from '@/types/task';

export const getFilterSummary = (
  selectedSkills: SkillType[],
  selectedClientIds: string[],
  monthRange: { start: number; end: number }
): string => {
  const parts = [];
  if (selectedSkills.length > 0) {
    parts.push(`${selectedSkills.length} skills`);
  }
  if (selectedClientIds.length > 0) {
    parts.push(`${selectedClientIds.length} clients`);
  }
  const monthCount = monthRange.end - monthRange.start + 1;
  parts.push(`${monthCount} months`);
  
  return parts.join(', ');
};
