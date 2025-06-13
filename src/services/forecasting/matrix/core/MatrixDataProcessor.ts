
import { MatrixData, MatrixDataPoint, MonthInfo } from '../types';
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { SkillType } from '@/types/task';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { debugLog } from '../../logger';

/**
 * Matrix Data Processor
 * Handles the transformation of demand matrix and capacity forecast into unified matrix data
 */
export class MatrixDataProcessor {
  /**
   * Transform demand matrix and capacity forecast with consistent skill handling
   */
  static skillConsistentTransformDemandToMatrix(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): MatrixData {
    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Starting transformation with consistent skill handling');

    const months: MonthInfo[] = demandMatrix.months.map((m, index) => ({
      key: m.key,
      label: m.label,
      index: index
    }));

    // Use normalized demand skills as the primary skill set
    const demandSkills = [...demandMatrix.skills];
    
    // Extract and normalize capacity skills
    const capacitySkillsRaw: string[] = [];
    capacityForecast.forEach(period => {
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill && !capacitySkillsRaw.includes(c.skill)) {
            capacitySkillsRaw.push(c.skill);
          }
        });
      }
    });
    
    // Normalize capacity skills for consistency
    const normalizedCapacitySkills = capacitySkillsRaw.map(skill => 
      SkillNormalizationService.normalizeSkill(skill)
    );
    
    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Skill normalization results', {
      demandSkills,
      capacitySkillsRaw,
      normalizedCapacitySkills
    });

    // Build unified skill set with normalized skills
    const skillSet = new Set<SkillType>();
    
    // Add demand skills first (they have priority and are already normalized)
    demandMatrix.skills.forEach(skill => skillSet.add(skill));
    
    // Add normalized capacity skills that don't conflict
    normalizedCapacitySkills.forEach(skill => {
      if (!demandMatrix.skills.includes(skill)) {
        skillSet.add(skill);
      }
    });
    
    const skills = Array.from(skillSet).sort() as SkillType[];

    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Final unified skill set', { skills });

    // Create demand and capacity maps
    const { demandMap, capacityMap } = this.createSkillMaps(demandMatrix, capacityForecast);

    // Generate data points using consistent normalized skills
    const dataPoints = this.generateDataPoints(skills, months, demandMap, capacityMap);

    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalCapacity = dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const totalGap = totalDemand - totalCapacity;

    const matrixData: MatrixData = {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalCapacity,
      totalGap
    };

    debugLog('🔧 [SKILL CONSISTENT TRANSFORM] Transformation complete with consistent skills', {
      originalDemandTotal: demandMatrix.totalDemand,
      transformedDemandTotal: totalDemand,
      skillConsistencyMaintained: demandMatrix.totalDemand === totalDemand,
      skillCount: skills.length
    });

    return matrixData;
  }

  /**
   * Create demand and capacity maps with skill normalization
   */
  private static createSkillMaps(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): {
    demandMap: Map<string, Map<SkillType, DemandDataPoint>>;
    capacityMap: Map<string, Map<SkillType, number>>;
  } {
    // Create demand map using normalized skills (already done in demandMatrix)
    const demandMap = new Map<string, Map<SkillType, DemandDataPoint>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandMap.get(dp.month) || new Map<SkillType, DemandDataPoint>();
      monthMap.set(dp.skillType as SkillType, dp);
      demandMap.set(dp.month, monthMap);
    });

    // Create capacity map with skill normalization
    const capacityMap = new Map<string, Map<SkillType, number>>();
    capacityForecast.forEach(period => {
      const monthMap = capacityMap.get(period.period) || new Map<SkillType, number>();
      if (period.capacity && Array.isArray(period.capacity)) {
        period.capacity.forEach((c: any) => {
          if (c.skill && typeof c.hours === 'number') {
            // Normalize capacity skill before matching
            const normalizedSkill = SkillNormalizationService.normalizeSkill(c.skill) as SkillType;
            const existingHours = monthMap.get(normalizedSkill) || 0;
            monthMap.set(normalizedSkill, existingHours + c.hours);
          }
        });
      }
      capacityMap.set(period.period, monthMap);
    });

    return { demandMap, capacityMap };
  }

  /**
   * Generate data points for all skill-month combinations
   */
  private static generateDataPoints(
    skills: SkillType[],
    months: MonthInfo[],
    demandMap: Map<string, Map<SkillType, DemandDataPoint>>,
    capacityMap: Map<string, Map<SkillType, number>>
  ): MatrixDataPoint[] {
    const dataPoints: MatrixDataPoint[] = [];
    
    for (const skill of skills) {
      for (const month of months) {
        const demandPoint = demandMap.get(month.key)?.get(skill);
        const demandHours = demandPoint?.demandHours || 0;
        const capacityHours = capacityMap.get(month.key)?.get(skill) || 0;
        const gap = demandHours - capacityHours;
        const utilizationPercent = capacityHours > 0 ? Math.round((demandHours / capacityHours) * 100) : 0;

        dataPoints.push({
          skillType: skill,
          month: month.key,
          monthLabel: month.label,
          demandHours,
          capacityHours,
          gap,
          utilizationPercent
        });
      }
    }

    return dataPoints;
  }
}
