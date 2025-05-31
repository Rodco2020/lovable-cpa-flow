
import { normalizeSkills } from '@/services/skillNormalizationService';
import { FormattedTask } from '../types';

/**
 * Skill Deduplication Service
 * 
 * Handles proper deduplication and normalization of skills for filter options
 * Fixes the duplicate skill entries issue in Advanced Filters
 */
export class SkillDeduplicationService {
  private static DEBUG_MODE = true;

  private static debugLog(message: string, data?: any) {
    if (this.DEBUG_MODE) {
      console.log(`[Skill Deduplication] ${message}`, data || '');
    }
  }

  /**
   * Extract and deduplicate skills from tasks with proper normalization
   */
  static extractUniqueSkills(tasks: FormattedTask[]): string[] {
    this.debugLog(`Processing ${tasks.length} tasks for skill extraction`);
    
    // Collect all raw skills from all tasks
    const allRawSkills: string[] = [];
    tasks.forEach(task => {
      if (Array.isArray(task.requiredSkills)) {
        allRawSkills.push(...task.requiredSkills);
      }
    });
    
    this.debugLog(`Found ${allRawSkills.length} total skill entries`, allRawSkills);
    
    // Use Set to deduplicate raw skills first
    const uniqueRawSkills = [...new Set(allRawSkills)];
    this.debugLog(`After raw deduplication: ${uniqueRawSkills.length} unique skills`, uniqueRawSkills);
    
    // Normalize skills and deduplicate again
    const normalizedSkillsSet = new Set<string>();
    
    uniqueRawSkills.forEach(skill => {
      if (skill && typeof skill === 'string' && skill.trim() !== '') {
        const normalized = normalizeSkills([skill]);
        normalized.forEach(normalizedSkill => {
          normalizedSkillsSet.add(normalizedSkill);
        });
      }
    });
    
    const finalSkills = [...normalizedSkillsSet].sort();
    
    this.debugLog(`Final deduplicated and normalized skills: ${finalSkills.length}`, finalSkills);
    
    return finalSkills;
  }

  /**
   * Extract unique priorities from tasks
   */
  static extractUniquePriorities(tasks: FormattedTask[]): string[] {
    const priorities = new Set<string>();
    
    tasks.forEach(task => {
      if (task.priority && typeof task.priority === 'string' && task.priority.trim() !== '') {
        priorities.add(task.priority.trim());
      }
    });
    
    return [...priorities].sort();
  }

  /**
   * Extract unique clients from tasks
   */
  static extractUniqueClients(tasks: FormattedTask[]): Array<{id: string, name: string}> {
    const clientMap = new Map<string, string>();
    
    tasks.forEach(task => {
      if (task.clientId && task.clientName && 
          typeof task.clientId === 'string' && typeof task.clientName === 'string' &&
          task.clientId.trim() !== '' && task.clientName.trim() !== '') {
        clientMap.set(task.clientId.trim(), task.clientName.trim());
      }
    });
    
    return Array.from(clientMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Validate skill data integrity
   */
  static validateSkillData(tasks: FormattedTask[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    let invalidCount = 0;
    
    tasks.forEach((task, index) => {
      if (!Array.isArray(task.requiredSkills)) {
        issues.push(`Task ${index + 1}: requiredSkills is not an array`);
        invalidCount++;
      } else {
        task.requiredSkills.forEach((skill, skillIndex) => {
          if (typeof skill !== 'string' || skill.trim() === '') {
            issues.push(`Task ${index + 1}, skill ${skillIndex + 1}: invalid skill value`);
            invalidCount++;
          }
        });
      }
    });
    
    return {
      isValid: invalidCount === 0,
      issues
    };
  }

  /**
   * Generate comprehensive filter options from tasks
   */
  static generateFilterOptions(tasks: FormattedTask[]) {
    this.debugLog('Generating comprehensive filter options');
    
    // Validate data first
    const validation = this.validateSkillData(tasks);
    if (!validation.isValid) {
      console.warn('Skill data validation issues:', validation.issues);
    }
    
    return {
      skills: this.extractUniqueSkills(tasks),
      priorities: this.extractUniquePriorities(tasks),
      clients: this.extractUniqueClients(tasks),
      validation
    };
  }

  /**
   * Toggle debug mode
   */
  static setDebugMode(enabled: boolean) {
    this.DEBUG_MODE = enabled;
    this.debugLog(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}
