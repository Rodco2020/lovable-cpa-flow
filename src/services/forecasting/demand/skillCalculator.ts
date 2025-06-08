
import { RecurringTaskDB, SkillType } from '@/types/task';
import { SkillHours } from '@/types/forecasting';
import { RecurrenceCalculator } from './recurrenceCalculator';

/**
 * Skill Calculator Service
 * Handles skill-based demand calculations
 */
export class SkillCalculator {
  /**
   * Calculate demand by skill for a specific month
   */
  static calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): SkillHours[] {
    const skillDemandMap = new Map<SkillType, number>();

    tasks.forEach(task => {
      const calculation = RecurrenceCalculator.calculateMonthlyDemand(task, monthStart, monthEnd);
      
      // Distribute hours across required skills
      task.required_skills.forEach((skill: SkillType) => {
        const currentHours = skillDemandMap.get(skill) || 0;
        // Divide hours by number of skills if task requires multiple skills
        const hoursPerSkill = calculation.monthlyHours / task.required_skills.length;
        skillDemandMap.set(skill, currentHours + hoursPerSkill);
      });
    });

    // Convert map to SkillHours array
    return Array.from(skillDemandMap.entries()).map(([skill, hours]) => ({
      skill,
      hours: Math.round(hours * 100) / 100 // Round to 2 decimal places
    }));
  }
}
