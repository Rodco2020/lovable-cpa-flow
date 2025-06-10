
import { SkillHours } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { SkillCalculatorCore } from './skillCalculator/skillCalculatorCore';
import { SkillDataProcessor } from './skillCalculator/skillDataProcessor';
import { AnnualTaskTracker } from './skillCalculator/annualTaskTracker';

/**
 * Enhanced Skill Calculator with comprehensive annual task debugging
 * 
 * This class maintains backward compatibility while delegating to the
 * refactored modular implementation. This ensures zero breaking changes
 * while providing improved maintainability.
 * 
 * The refactoring:
 * ✅ Maintains exact same functionality
 * ✅ Preserves all existing behavior
 * ✅ Keeps the same public interface
 * ✅ Improves code organization
 * ✅ Enhances maintainability
 * ✅ Enables better testing
 * 
 * @deprecated Consider using SkillCalculatorCore directly for new code
 */
export class SkillCalculator {
  /**
   * Calculate monthly demand by skill with enhanced annual task debugging
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<SkillHours[]> {
    // Delegate to the refactored core implementation
    return SkillCalculatorCore.calculateMonthlyDemandBySkill(tasks, monthStart, monthEnd);
  }

  /**
   * Predict if an annual task should be included in the current period
   */
  private static predictAnnualTaskInclusion(task: RecurringTaskDB, periodMonth: number): {
    shouldInclude: boolean;
    reason: string;
    confidence: 'High' | 'Medium' | 'Low';
  } {
    // Delegate to the annual task tracker
    return AnnualTaskTracker.predictAnnualTaskInclusion(task, periodMonth);
  }

  /**
   * Aggregate skill hours across multiple periods
   */
  static aggregateSkillHours(skillHoursArray: SkillHours[][]): SkillHours[] {
    // Delegate to the skill data processor
    return SkillDataProcessor.aggregateSkillHours(skillHoursArray);
  }
}
