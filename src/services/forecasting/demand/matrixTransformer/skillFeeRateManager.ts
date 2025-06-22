
/**
 * Skill Fee Rate Manager
 * Handles skill-based fee rate calculations and management
 */
export class SkillFeeRateManager {
  private static readonly DEFAULT_FEE_RATE = 150;

  /**
   * Get skill fee rates map
   */
  async getSkillFeeRates(): Promise<Map<string, number>> {
    // For now, return a default fee rate structure
    // This can be enhanced to pull from database or configuration
    const feeRates = new Map<string, number>();
    
    // Set default rates for common skills
    const defaultSkills = [
      'Tax Preparation',
      'Bookkeeping', 
      'Audit',
      'Advisory',
      'Payroll',
      'Compliance'
    ];
    
    defaultSkills.forEach(skill => {
      feeRates.set(skill, SkillFeeRateManager.DEFAULT_FEE_RATE);
    });
    
    return feeRates;
  }

  /**
   * Get fee rate for a specific skill
   */
  getFeeRateForSkill(skill: string, feeRates: Map<string, number>): number {
    return feeRates.get(skill) || SkillFeeRateManager.DEFAULT_FEE_RATE;
  }
}
