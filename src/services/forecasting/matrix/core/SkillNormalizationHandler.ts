
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { debugLog } from '../../logger';

/**
 * Skill Normalization Handler
 * Handles skill normalization for demand matrices to ensure consistency
 */
export class SkillNormalizationHandler {
  /**
   * Normalize demand matrix skills for consistency with capacity matrix
   */
  static async normalizeDemandMatrixSkills(demandMatrix: DemandMatrixData): Promise<DemandMatrixData> {
    debugLog('🔧 [SKILL NORMALIZATION] Normalizing demand matrix skills for consistency');
    
    // Build skill normalization map
    const skillNormalizationMap = new Map<string, SkillType>();
    const normalizedSkills: SkillType[] = [];
    
    for (const originalSkill of demandMatrix.skills) {
      const normalizedSkill = SkillNormalizationService.normalizeSkill(originalSkill);
      skillNormalizationMap.set(originalSkill, normalizedSkill);
      
      if (!normalizedSkills.includes(normalizedSkill)) {
        normalizedSkills.push(normalizedSkill);
      }
      
      debugLog(`🔧 [SKILL NORMALIZATION] "${originalSkill}" -> "${normalizedSkill}"`);
    }
    
    // Transform data points with normalized skills
    const normalizedDataPoints = demandMatrix.dataPoints.map(dp => ({
      ...dp,
      skillType: skillNormalizationMap.get(dp.skillType) || dp.skillType
    }));
    
    // Aggregate data points by normalized skills (in case multiple original skills map to same normalized skill)
    const aggregatedDataPoints: DemandDataPoint[] = [];
    const aggregationMap = new Map<string, DemandDataPoint>();
    
    normalizedDataPoints.forEach(dp => {
      const key = `${dp.month}-${dp.skillType}`;
      const existing = aggregationMap.get(key);
      
      if (existing) {
        // Aggregate demand hours and client tasks
        existing.demandHours += dp.demandHours;
        existing.taskBreakdown.push(...dp.taskBreakdown);
      } else {
        aggregationMap.set(key, { ...dp });
      }
    });
    
    aggregatedDataPoints.push(...Array.from(aggregationMap.values()));
    
    // Recalculate totals after normalization
    const totalDemand = aggregatedDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    
    const normalizedMatrix: DemandMatrixData = {
      ...demandMatrix,
      skills: normalizedSkills.sort(),
      dataPoints: aggregatedDataPoints,
      totalDemand
    };
    
    debugLog('🔧 [SKILL NORMALIZATION] Demand matrix normalization complete', {
      originalSkills: demandMatrix.skills.length,
      normalizedSkills: normalizedSkills.length,
      originalTotalDemand: demandMatrix.totalDemand,
      normalizedTotalDemand: totalDemand,
      mappingRules: Array.from(skillNormalizationMap.entries())
    });
    
    return normalizedMatrix;
  }
}
