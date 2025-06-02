
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { getAllStaff } from '@/services/staffService';
import { SkillType } from '@/types/task';
import { StaffSkillAnalysis } from '../types';

export class StaffSkillAnalysisService {
  /**
   * Analyze staff skills and return structured analysis
   */
  static async analyzeStaffSkills(skills: string[], staffId: string): Promise<Partial<StaffSkillAnalysis>> {
    // Normalize the skills using the centralized service
    const mappedSkills = await SkillNormalizationService.normalizeSkills(skills, staffId);
    
    // Analyze the mapped skills
    const hasCPA = mappedSkills.includes('CPA');
    const hasSenior = mappedSkills.includes('Senior Staff');
    const hasJunior = mappedSkills.includes('Junior Staff');
    
    // Check if defaulted to Junior (happens when no skills provided or mapping fails)
    const defaultedToJunior = mappedSkills.length === 1 && mappedSkills[0] === 'Junior Staff' && skills.length === 0;

    return {
      mappedSkills,
      hasCPA,
      hasSenior,
      hasJunior,
      defaultedToJunior
    };
  }

  /**
   * Load and analyze all staff skills
   */
  static async loadAllStaffSkills(): Promise<StaffSkillAnalysis[]> {
    console.log("Loading staff skills for analysis");
    
    // Get all staff members
    const allStaff = await getAllStaff();
    console.log("Loaded staff:", allStaff.length);
    
    // Analyze skills for each staff member
    const skillAnalysisPromises = allStaff.map(async (staff) => {
      const analysis = await this.analyzeStaffSkills(staff.assignedSkills, staff.id);
      return {
        id: staff.id,
        name: staff.fullName,
        roleTitle: staff.roleTitle,
        originalSkills: staff.assignedSkills,
        ...analysis
      } as StaffSkillAnalysis;
    });
    
    return Promise.all(skillAnalysisPromises);
  }
}
