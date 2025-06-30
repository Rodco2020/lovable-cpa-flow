
import { debugLog } from '../../logger';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { SkillResolutionService } from '../skillResolutionService';
import { SkillMappingResult } from './types';

/**
 * Service responsible for extracting and mapping skills for matrix transformation
 * Enhanced with comprehensive skill name resolution
 */
export class SkillMappingService {
  /**
   * Extract unique skills with bidirectional mapping and UUID resolution
   */
  static async extractUniqueSkillsWithMapping(
    forecastData: ForecastData[], 
    tasks: RecurringTaskDB[]
  ): Promise<SkillMappingResult> {
    try {
      const skillRefsSet = new Set<string>();
      const skillMapping = new Map<string, string>(); // UUID/Name -> Display Name

      console.log('🔍 [SKILL MAPPING] Extracting skills with enhanced mapping...');

      // Extract from forecast data (these could be UUIDs or display names)
      forecastData.forEach(period => {
        if (period && Array.isArray(period.demand)) {
          period.demand.forEach(demandItem => {
            if (demandItem && typeof demandItem.skill === 'string' && demandItem.skill.trim().length > 0) {
              skillRefsSet.add(demandItem.skill.trim());
            }
          });
        }
      });

      // Extract from validated tasks
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

      // Separate UUIDs from display names
      const uuids = allSkillRefs.filter(ref => this.isUUID(ref));
      const displayNames = allSkillRefs.filter(ref => !this.isUUID(ref));

      console.log('🔍 [SKILL MAPPING] Categorized references:', {
        uuids: uuids.length,
        displayNames: displayNames.length
      });

      // Resolve UUIDs to display names
      if (uuids.length > 0) {
        try {
          const resolvedNames = await SkillResolutionService.getSkillNames(uuids);
          
          uuids.forEach((uuid, index) => {
            const displayName = resolvedNames[index] || uuid;
            skillMapping.set(uuid, displayName);
            skillMapping.set(displayName, displayName); // Self-mapping for consistency
            
            console.log(`🔍 [SKILL MAPPING] UUID resolved: ${uuid} -> ${displayName}`);
          });
        } catch (error) {
          console.error('❌ [SKILL MAPPING] Error resolving UUIDs:', error);
          
          // Fallback: use UUIDs as display names
          uuids.forEach(uuid => {
            skillMapping.set(uuid, uuid);
          });
        }
      }

      // Map display names to themselves
      displayNames.forEach(name => {
        skillMapping.set(name, name);
      });

      // Get unique resolved display names
      const uniqueSkillNames = Array.from(new Set(Array.from(skillMapping.values())))
        .filter(name => name && name.length > 0)
        .filter(name => this.validateSkillName(name)) // Add validation
        .slice(0, 100); // Reasonable limit
      
      console.log(`📊 [SKILL MAPPING] Final skills with enhanced mapping:`, {
        uniqueSkills: uniqueSkillNames,
        mappingSize: skillMapping.size,
        sampleMapping: Array.from(skillMapping.entries()).slice(0, 5),
        validationResults: {
          totalSkills: uniqueSkillNames.length,
          uuidsFound: uniqueSkillNames.filter(name => this.isUUID(name)).length,
          displayNamesFound: uniqueSkillNames.filter(name => !this.isUUID(name)).length
        }
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

  /**
   * Validate that a skill name is properly resolved (not a UUID)
   */
  private static validateSkillName(skillName: string): boolean {
    if (this.isUUID(skillName)) {
      console.warn(`⚠️ [SKILL MAPPING] Skill name validation failed - UUID detected: ${skillName}`);
      return false;
    }
    
    if (!skillName || skillName.trim().length === 0) {
      console.warn(`⚠️ [SKILL MAPPING] Skill name validation failed - empty: ${skillName}`);
      return false;
    }
    
    return true;
  }

  /**
   * Get skill mapping statistics for debugging
   */
  static getSkillMappingStats(skillMapping: Map<string, string>): {
    totalMappings: number;
    uuidMappings: number;
    displayNameMappings: number;
    uniqueDisplayNames: number;
  } {
    const entries = Array.from(skillMapping.entries());
    const uuidMappings = entries.filter(([key]) => this.isUUID(key)).length;
    const displayNameMappings = entries.filter(([key]) => !this.isUUID(key)).length;
    const uniqueDisplayNames = new Set(Array.from(skillMapping.values())).size;

    return {
      totalMappings: skillMapping.size,
      uuidMappings,
      displayNameMappings,
      uniqueDisplayNames
    };
  }
}
