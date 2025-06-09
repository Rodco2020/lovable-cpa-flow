
import { debugLog } from '../../logger';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { SkillResolutionService } from '../skillResolutionService';
import { SkillMappingResult } from './types';

/**
 * Service responsible for extracting and mapping skills for matrix transformation
 */
export class SkillMappingService {
  /**
   * Extract unique skills with bidirectional mapping for consistent matching
   */
  static async extractUniqueSkillsWithMapping(
    forecastData: ForecastData[], 
    tasks: RecurringTaskDB[]
  ): Promise<SkillMappingResult> {
    try {
      const skillRefsSet = new Set<string>();
      const skillMapping = new Map<string, string>(); // UUID -> Display Name

      console.log('🔍 [SKILL MAPPING] Extracting skills with mapping...');

      // Extract from forecast data (these should be display names already)
      forecastData.forEach(period => {
        if (period && Array.isArray(period.demand)) {
          period.demand.forEach(demandItem => {
            if (demandItem && typeof demandItem.skill === 'string' && demandItem.skill.trim().length > 0) {
              skillRefsSet.add(demandItem.skill.trim());
            }
          });
        }
      });

      // Extract from validated tasks and build mapping
      for (const task of tasks) {
        if (task && Array.isArray(task.required_skills)) {
          for (const skillRef of task.required_skills) {
            if (typeof skillRef === 'string' && skillRef.trim().length > 0) {
              skillRefsSet.add(skillRef.trim());
            }
          }
        }
      }

      const allSkillRefs = Array.from(skillRefsSet);
      console.log('🎯 [SKILL MAPPING] Collected skill references:', allSkillRefs);

      if (allSkillRefs.length === 0) {
        console.warn('⚠️ [SKILL MAPPING] No skill references found');
        return { skills: [], skillMapping: new Map() };
      }

      // Build comprehensive skill mapping
      for (const skillRef of allSkillRefs) {
        if (this.isUUID(skillRef)) {
          // It's a UUID - resolve to display name
          const displayNames = await SkillResolutionService.getSkillNames([skillRef]);
          const displayName = displayNames[0] || skillRef;
          skillMapping.set(skillRef, displayName);
          skillMapping.set(displayName, displayName); // Self-mapping for consistency
        } else {
          // It's already a display name
          skillMapping.set(skillRef, skillRef);
        }
      }

      // Get unique display names
      const uniqueSkillNames = Array.from(new Set(Array.from(skillMapping.values())))
        .filter(name => name && name.length > 0)
        .slice(0, 100); // Reasonable limit
      
      console.log(`📊 [SKILL MAPPING] Final skills with mapping:`, {
        uniqueSkills: uniqueSkillNames,
        mappingSize: skillMapping.size,
        sampleMapping: Array.from(skillMapping.entries()).slice(0, 5)
      });
      
      return { skills: uniqueSkillNames, skillMapping };
    } catch (error) {
      console.error('❌ [SKILL MAPPING] Error extracting skills with mapping:', error);
      return { skills: [], skillMapping: new Map() };
    }
  }

  /**
   * Check if a string is a UUID
   */
  private static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
