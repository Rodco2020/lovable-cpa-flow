
import { SkillType } from '@/types/task';
import { DemandDataPoint } from '@/types/demand';
import { debugLog } from '../logger';

/**
 * Skill Preservation Service
 * Ensures skill keys are preserved exactly as they appear in source data
 * without any trimming, conversion, or normalization that could cause mapping corruption
 */
export class SkillPreservationService {
  /**
   * Create skill union while preserving original skill identifiers
   * Priority: Demand skills take precedence over capacity skills
   */
  static createPreservedSkillUnion(
    demandSkills: SkillType[],
    capacitySkills: SkillType[]
  ): SkillType[] {
    debugLog('Creating preserved skill union', { 
      demandSkillsCount: demandSkills.length,
      capacitySkillsCount: capacitySkills.length
    });

    // Use Set for uniqueness but preserve exact skill format
    const skillSet = new Set<SkillType>();
    
    // Add demand skills first (they have priority)
    demandSkills.forEach(skill => {
      if (skill != null && skill !== '') {
        skillSet.add(skill);
      }
    });
    
    // Add capacity skills that don't conflict with demand skills
    capacitySkills.forEach(skill => {
      if (skill != null && skill !== '' && !demandSkills.includes(skill)) {
        skillSet.add(skill);
      }
    });
    
    const preservedSkills = Array.from(skillSet).sort() as SkillType[];
    
    debugLog('Preserved skill union created', { 
      totalSkills: preservedSkills.length,
      preservedSkills: preservedSkills.slice(0, 5) // Log first 5 for debugging
    });
    
    return preservedSkills;
  }

  /**
   * Create demand lookup map using original skill keys
   * No normalization or trimming applied
   */
  static createPreservedDemandMap(
    dataPoints: DemandDataPoint[]
  ): Map<string, Map<SkillType, DemandDataPoint>> {
    const demandMap = new Map<string, Map<SkillType, DemandDataPoint>>();
    
    dataPoints.forEach(dp => {
      if (!dp.month || dp.skillType == null) return; // Skip invalid data points
      
      const monthMap = demandMap.get(dp.month) || new Map<SkillType, DemandDataPoint>();
      // Use original skill type exactly as provided - no conversion
      monthMap.set(dp.skillType as SkillType, dp);
      demandMap.set(dp.month, monthMap);
    });
    
    debugLog('Preserved demand map created', { 
      monthsCount: demandMap.size,
      totalDataPoints: dataPoints.length
    });
    
    return demandMap;
  }

  /**
   * Create capacity lookup map using original skill keys
   * No normalization or trimming applied
   */
  static createPreservedCapacityMap(
    capacityForecast: any[]
  ): Map<string, Map<SkillType, number>> {
    const capacityMap = new Map<string, Map<SkillType, number>>();
    
    capacityForecast.forEach(period => {
      if (!period.period || !Array.isArray(period.capacity)) return;
      
      const monthMap = capacityMap.get(period.period) || new Map<SkillType, number>();
      
      period.capacity.forEach((c: any) => {
        if (c.skill != null && typeof c.hours === 'number' && c.hours >= 0) {
          // Preserve original skill key format - no trimming or conversion
          const existingHours = monthMap.get(c.skill as SkillType) || 0;
          monthMap.set(c.skill as SkillType, existingHours + c.hours);
        }
      });
      
      capacityMap.set(period.period, monthMap);
    });
    
    debugLog('Preserved capacity map created', { 
      periodsCount: capacityMap.size
    });
    
    return capacityMap;
  }

  /**
   * Validate skill key consistency between maps
   * Ensures no skill keys were corrupted during transformation
   */
  static validateSkillKeyConsistency(
    originalSkills: SkillType[],
    demandMap: Map<string, Map<SkillType, DemandDataPoint>>,
    capacityMap: Map<string, Map<SkillType, number>>
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check that all original demand skills are preserved in maps
    originalSkills.forEach(skill => {
      let foundInDemand = false;
      
      for (const monthMap of demandMap.values()) {
        if (monthMap.has(skill)) {
          foundInDemand = true;
          break;
        }
      }
      
      if (!foundInDemand) {
        issues.push(`Skill '${skill}' missing from demand map`);
      }
    });
    
    // Validate no unexpected skill transformations occurred
    const demandSkillsInMap = new Set<SkillType>();
    for (const monthMap of demandMap.values()) {
      for (const skill of monthMap.keys()) {
        demandSkillsInMap.add(skill);
      }
    }
    
    const capacitySkillsInMap = new Set<SkillType>();
    for (const monthMap of capacityMap.values()) {
      for (const skill of monthMap.keys()) {
        capacitySkillsInMap.add(skill);
      }
    }
    
    // Check for skill key format changes
    demandSkillsInMap.forEach(skill => {
      const skillStr = String(skill);
      if (skillStr !== skillStr.trim()) {
        issues.push(`Skill '${skill}' contains whitespace that may cause issues`);
      }
    });
    
    const isValid = issues.length === 0;
    
    if (!isValid) {
      debugLog('Skill key consistency validation failed', { issues });
    }
    
    return { isValid, issues };
  }

  /**
   * Extract capacity skills preserving original format
   */
  static extractCapacitySkills(capacityForecast: any[]): SkillType[] {
    const skillSet = new Set<SkillType>();
    
    capacityForecast.forEach(period => {
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill != null && c.skill !== '') {
            skillSet.add(c.skill as SkillType);
          }
        });
      }
    });
    
    return Array.from(skillSet);
  }
}
