
import { SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { SkillValidationUtils } from './validationUtils';

/**
 * Skill data processing utilities
 */
export class SkillDataProcessor {
  /**
   * Convert skill demand map to SkillHours array
   */
  static convertToSkillHours(
    skillDemandMap: Map<SkillType, number>,
    periodMonthName: string
  ): SkillHours[] {
    return Array.from(skillDemandMap.entries())
      .map(([skill, hours]) => ({
        skill,
        hours: Math.max(0, hours),
        metadata: {
          staffCount: 0,
          staffIds: [],
          hoursBreakdown: {},
          calculationNotes: `Demand calculated for ${periodMonthName}. Total hours: ${hours}`
        }
      }))
      .filter(sh => sh.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  }

  /**
   * Aggregate skill hours across multiple periods
   */
  static aggregateSkillHours(skillHoursArray: SkillHours[][]): SkillHours[] {
    try {
      const validation = SkillValidationUtils.validateSkillHoursArray(skillHoursArray);
      if (!validation.isValid) {
        console.error('Skill hours aggregation validation failed:', validation.errors);
        return [];
      }

      const aggregatedMap = new Map<SkillType, number>();
      
      for (const periodSkillHours of skillHoursArray) {
        if (Array.isArray(periodSkillHours)) {
          for (const skillHour of periodSkillHours) {
            if (SkillValidationUtils.validateSkillHourEntry(skillHour)) {
              const current = aggregatedMap.get(skillHour.skill) || 0;
              aggregatedMap.set(skillHour.skill, current + Math.max(0, skillHour.hours));
            }
          }
        }
      }

      return Array.from(aggregatedMap.entries())
        .map(([skill, hours]) => ({
          skill,
          hours,
          metadata: {
            calculationNotes: 'Aggregated across multiple periods'
          }
        }))
        .filter(sh => sh.hours > 0)
        .sort((a, b) => b.hours - a.hours);

    } catch (error) {
      console.error('Error aggregating skill hours:', error);
      return [];
    }
  }

  /**
   * Update skill demand map with calculated hours
   */
  static updateSkillDemandMap(
    skillDemandMap: Map<SkillType, number>,
    requiredSkills: string[],
    calculatedHours: number,
    taskInfo: { id: string; name: string; isAnnualTask: boolean }
  ): void {
    if (Array.isArray(requiredSkills)) {
      for (const skillId of requiredSkills) {
        if (SkillValidationUtils.validateSkillId(skillId)) {
          const skill = skillId.trim();
          
          console.log(`🔧 [SKILL CALCULATOR] Adding hours for skill "${skill}":`, {
            currentHours: skillDemandMap.get(skill) || 0,
            additionalHours: calculatedHours,
            taskId: taskInfo.id,
            taskName: taskInfo.name,
            isAnnualTask: taskInfo.isAnnualTask
          });

          const currentHours = skillDemandMap.get(skill) || 0;
          const newTotal = currentHours + calculatedHours;
          skillDemandMap.set(skill, newTotal);

          console.log(`✨ [SKILL CALCULATOR] Skill "${skill}" updated:`, {
            previousTotal: currentHours,
            added: calculatedHours,
            newTotal: newTotal,
            fromAnnualTask: taskInfo.isAnnualTask,
            taskName: taskInfo.name
          });
        }
      }
    }
  }
}
