
/**
 * Skill Type Handler Utility
 * 
 * Handles skill type normalization and ensures consistent string types
 */

export class SkillTypeHandler {
  /**
   * Normalize skill type to string
   * Handles both string and string[] inputs
   */
  static normalizeSkillType(skillType: string | string[] | null | undefined): string {
    if (!skillType) return 'General';
    
    if (Array.isArray(skillType)) {
      // Take the first skill if array, or default to 'General'
      return skillType.length > 0 ? skillType[0] : 'General';
    }
    
    return skillType;
  }

  /**
   * Validate skill type format
   */
  static isValidSkillType(skillType: any): skillType is string {
    return typeof skillType === 'string' && skillType.length > 0;
  }

  /**
   * Extract skill types from task data
   */
  static extractSkillFromTask(task: any): string {
    // Try different property names that might contain skills
    const skillSources = [
      task.required_skills,
      task.skill_type,
      task.skillType,
      task.skills
    ];

    for (const source of skillSources) {
      if (source) {
        return this.normalizeSkillType(source);
      }
    }

    return 'General';
  }
}
