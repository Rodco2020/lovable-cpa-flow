
import { SkillType } from '@/types/task';
import { StaffSkillAnalysis, SkillCounts } from '../types';

export class SkillCountUtils {
  /**
   * Calculate skill type counts from staff analysis data
   */
  static calculateSkillCounts(staffSkills: StaffSkillAnalysis[]): SkillCounts {
    const counts: SkillCounts = {
      'Junior Staff': 0,
      'Senior Staff': 0,
      'CPA': 0
    };
    
    staffSkills.forEach(staff => {
      staff.mappedSkills.forEach((skill: SkillType) => {
        if (counts.hasOwnProperty(skill)) {
          counts[skill as keyof SkillCounts]++;
        }
      });
    });
    
    return counts;
  }

  /**
   * Get skill badge color based on skill type
   */
  static getSkillBadgeColor(skill: string): string {
    switch (skill) {
      case 'Junior Staff':
        return 'bg-blue-100';
      case 'Senior Staff':
        return 'bg-purple-100';
      case 'CPA':
        return 'bg-green-100';
      default:
        return '';
    }
  }
}
