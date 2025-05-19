import { DateRange, ForecastMode, SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { getAllStaff, getWeeklyAvailabilityByStaff } from '@/services/staffService';
import { debugLog } from './logger';

export interface CapacityOptions {
  dateRange: DateRange;
  mode: ForecastMode;
  includeSkills: SkillType[] | 'all';
}

export const calculateCapacity = async ({
  dateRange,
  mode,
  includeSkills
}: CapacityOptions): Promise<SkillHours[]> => {
  const allStaff = await getAllStaff();
  const skillHoursMap: Record<SkillType, number> = {};

  debugLog(
    `Calculating capacity for date range: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`
  );
  debugLog('Using skill allocation strategy: distribute (hardcoded for accuracy)');

  for (const staff of allStaff) {
    if (staff.status !== 'active') {
      debugLog(`Skipping inactive staff member ${staff.id} (${staff.fullName})`);
      continue;
    }

    if (
      includeSkills !== 'all' &&
      !staff.skills.some(skillId => includeSkills.includes(skillId as SkillType))
    ) {
      debugLog(`Skipping staff ${staff.id} (${staff.fullName}): skills don't match filter`, {
        staffSkills: staff.skills,
        filterSkills: includeSkills
      });
      continue;
    }

    const weeklyAvailability = await getWeeklyAvailabilityByStaff(staff.id);
    let totalWeeklyHours = 0;
    weeklyAvailability.forEach(slot => {
      if (slot.isAvailable) {
        const startParts = slot.startTime.split(':').map(Number);
        const endParts = slot.endTime.split(':').map(Number);
        const startHours = startParts[0] + startParts[1] / 60;
        const endHours = endParts[0] + endParts[1] / 60;
        const slotHours = Math.max(0, endHours - startHours);
        totalWeeklyHours += slotHours;
      }
    });

    debugLog(`Staff ${staff.id} (${staff.fullName}) weekly availability: ${totalWeeklyHours.toFixed(2)} hours`);

    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
    const startTime = dateRange.startDate.getTime();
    const endTime = dateRange.endDate.getTime();
    const exactWeeksInPeriod = (endTime - startTime) / millisecondsInWeek;

    debugLog(`Exact weeks in period for ${staff.fullName}: ${exactWeeksInPeriod.toFixed(4)}`);

    const totalHours = totalWeeklyHours * exactWeeksInPeriod;

    debugLog(`Total capacity hours for ${staff.fullName}: ${totalHours.toFixed(2)}`);

    if (staff.skills.length > 0) {
      const hoursPerSkill = totalHours / staff.skills.length;
      debugLog(`Distributing ${totalHours}h across ${staff.skills.length} skills (${hoursPerSkill}h per skill)`);
      staff.skills.forEach(skillId => {
        const skill = skillId as SkillType;
        skillHoursMap[skill] = (skillHoursMap[skill] || 0) + hoursPerSkill;
        debugLog(`  - Allocated ${hoursPerSkill}h to skill ${skill}`);
      });
    }
  }

  const result: SkillHours[] = Object.entries(skillHoursMap).map(([skill, hours]) => ({
    skill: skill as SkillType,
    hours
  }));

  debugLog('Capacity calculation complete, results:', result);
  const totalCapacity = result.reduce((sum, item) => sum + item.hours, 0);
  debugLog(`Total capacity across all skills: ${totalCapacity.toFixed(2)} hours`);

  return result;
};

