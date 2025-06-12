
import { SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';

/**
 * Skill data processing utilities
 * FIXED: Now handles full task hours allocation per skill
 */
export class SkillDataProcessor {
  /**
   * Update skill demand map with full task hours per skill
   * FIXED: Allocates full task hours to each required skill
   */
  static updateSkillDemandMap(
    skillDemandMap: Map<SkillType, number>,
    requiredSkills: string[],
    taskHours: number,
    taskInfo: { id: string; name: string; isAnnualTask: boolean }
  ): void {
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      console.warn(`⚠️ [SKILL PROCESSOR] Task ${taskInfo.id} has no required skills`);
      return;
    }

    console.log(`🔄 [SKILL PROCESSOR] Processing ${requiredSkills.length} skills for task ${taskInfo.id}:`, {
      taskName: taskInfo.name,
      requiredSkills,
      taskHours,
      isAnnualTask: taskInfo.isAnnualTask,
      allocationMethod: 'FULL_HOURS_PER_SKILL' // FIXED: Full hours per skill
    });

    // CRITICAL FIX: Allocate FULL task hours to each required skill
    requiredSkills.forEach((skill, index) => {
      if (!skill || typeof skill !== 'string') {
        console.warn(`⚠️ [SKILL PROCESSOR] Invalid skill at index ${index} for task ${taskInfo.id}:`, skill);
        return;
      }

      const normalizedSkill = skill as SkillType;
      const currentHours = skillDemandMap.get(normalizedSkill) || 0;
      
      // FIXED: Use full task hours for each skill (not divided)
      const newHours = currentHours + taskHours;
      skillDemandMap.set(normalizedSkill, newHours);

      console.log(`✅ [SKILL PROCESSOR] Added ${taskHours}h to skill "${normalizedSkill}" (total: ${newHours}h) for task ${taskInfo.id}`);
    });

    console.log(`📊 [SKILL PROCESSOR] Task ${taskInfo.id} complete - allocated ${taskHours}h to ${requiredSkills.length} skills`);
  }

  /**
   * Convert skill demand map to SkillHours array
   */
  static convertToSkillHours(
    skillDemandMap: Map<SkillType, number>,
    periodName: string
  ): SkillHours[] {
    const skillHours: SkillHours[] = [];

    console.log(`🔄 [SKILL PROCESSOR] Converting skill demand map to SkillHours array for ${periodName}:`, {
      skillCount: skillDemandMap.size,
      totalSkillEntries: Array.from(skillDemandMap.entries()).length
    });

    skillDemandMap.forEach((hours, skill) => {
      if (hours > 0) {
        skillHours.push({ skill, hours });
        console.log(`✅ [SKILL PROCESSOR] Added skill "${skill}" with ${hours}h to final results`);
      } else {
        console.log(`⏭️ [SKILL PROCESSOR] Skipped skill "${skill}" with ${hours}h (zero hours)`);
      }
    });

    // Sort by hours descending for better readability
    skillHours.sort((a, b) => b.hours - a.hours);

    console.log(`📈 [SKILL PROCESSOR] Final skill hours for ${periodName}:`, {
      skillsWithDemand: skillHours.length,
      totalHours: skillHours.reduce((sum, sh) => sum + sh.hours, 0),
      topSkills: skillHours.slice(0, 3).map(sh => ({ skill: sh.skill, hours: sh.hours }))
    });

    return skillHours;
  }

  /**
   * Aggregate skill hours across multiple periods
   * ADDED: Missing method that was being called from SkillCalculator
   */
  static aggregateSkillHours(skillHoursArray: SkillHours[][]): SkillHours[] {
    const aggregatedMap = new Map<SkillType, number>();

    // Process each array of skill hours
    skillHoursArray.forEach(skillHoursSet => {
      skillHoursSet.forEach(skillHour => {
        const currentHours = aggregatedMap.get(skillHour.skill) || 0;
        aggregatedMap.set(skillHour.skill, currentHours + skillHour.hours);
      });
    });

    // Convert back to SkillHours array
    const result: SkillHours[] = [];
    aggregatedMap.forEach((hours, skill) => {
      result.push({ skill, hours });
    });

    // Sort by hours descending
    result.sort((a, b) => b.hours - a.hours);

    return result;
  }
}
