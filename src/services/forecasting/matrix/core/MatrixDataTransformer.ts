
import { MatrixData, MonthInfo, MatrixDataPoint } from '../types';
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { SkillType } from '@/types/task';
import { MatrixDebugLogger } from '../debug/MatrixDebugLogger';

/**
 * Matrix Data Transformer
 * Handles transformation between different matrix data formats
 */
export class MatrixDataTransformer {
  /**
   * Transform demand matrix and capacity forecast into MatrixData WITH ENHANCED DEBUGGING
   */
  static transformDemandToMatrix(
    demandMatrix: DemandMatrixData,
    capacityForecast: any[]
  ): MatrixData {
    // PHASE 1: Enhanced debugging - Log transformation start
    MatrixDebugLogger.logTransformationStart(demandMatrix, capacityForecast);

    const months: MonthInfo[] = demandMatrix.months.map((m, index) => ({
      key: m.key,
      label: m.label,
      index: (m as any).index ?? index
    }));

    // Build skill set
    const { skills } = this.buildSkillSet(demandMatrix, capacityForecast);

    // Build data maps
    const { demandMap, capacityMap } = this.buildDataMaps(demandMatrix, capacityForecast);

    // Generate data points
    const dataPoints = this.generateDataPoints(skills, months, demandMap, capacityMap);

    // Calculate totals
    const totals = this.calculateTotals(dataPoints);

    const matrixData: MatrixData = {
      months,
      skills,
      dataPoints,
      ...totals
    };

    // Final validation and logging
    this.validateAndLogTransformation(demandMatrix, matrixData);

    return matrixData;
  }

  /**
   * Build unified skill set from demand and capacity data
   */
  private static buildSkillSet(demandMatrix: DemandMatrixData, capacityForecast: any[]) {
    const demandSkills = demandMatrix.skills;
    const capacitySkills: string[] = [];
    
    capacityForecast.forEach(period => {
      period.capacity.forEach((c: any) => capacitySkills.push(String(c.skill).trim()));
    });

    // Build the union of all skills from demand and capacity data
    const skillSet = new Set<string>();
    demandMatrix.skills.forEach(s => skillSet.add(String(s).trim()));
    capacityForecast.forEach(period => {
      period.capacity.forEach((c: any) => skillSet.add(String(c.skill).trim()));
    });
    const skills = Array.from(skillSet).sort() as SkillType[];

    // Enhanced debugging - Log skill set creation results
    MatrixDebugLogger.logSkillSetCreation(demandSkills, capacitySkills, skills);

    // VALIDATION CHECKPOINT: Skill set creation
    MatrixDebugLogger.logValidationCheckpoint(
      'Skill Set Creation',
      { originalSkills: demandSkills.length, finalSkills: skills.length },
      skills.length >= demandSkills.length
    );

    return { skills, demandSkills, capacitySkills };
  }

  /**
   * Build demand and capacity maps for data lookup
   */
  private static buildDataMaps(demandMatrix: DemandMatrixData, capacityForecast: any[]) {
    // Map month -> skill -> demand data using sanitized skill keys
    const demandMap = new Map<string, Map<string, DemandDataPoint>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandMap.get(dp.month) || new Map<string, DemandDataPoint>();
      const skillKey = String(dp.skillType).trim();
      monthMap.set(skillKey, dp);
      demandMap.set(dp.month, monthMap);
    });

    // Enhanced debugging - Log demand map creation
    MatrixDebugLogger.logDemandMapCreation(demandMatrix.dataPoints, demandMap);

    const capacityMap = new Map<string, Map<string, number>>();
    capacityForecast.forEach(period => {
      const monthMap = capacityMap.get(period.period) || new Map<string, number>();
      period.capacity.forEach((c: any) => {
        const skillKey = String(c.skill).trim();
        monthMap.set(skillKey, (monthMap.get(skillKey) || 0) + c.hours);
      });
      capacityMap.set(period.period, monthMap);
    });

    // Enhanced debugging - Log capacity map creation
    MatrixDebugLogger.logCapacityMapCreation(capacityForecast, capacityMap);

    // VALIDATION CHECKPOINT: Map creation
    const expectedDemandSum = demandMatrix.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const actualDemandInMap = Array.from(demandMap.values()).reduce((sum, monthMap) => {
      return sum + Array.from(monthMap.values()).reduce((monthSum, dp) => monthSum + dp.demandHours, 0);
    }, 0);
    
    MatrixDebugLogger.logValidationCheckpoint(
      'Demand Map Integrity',
      { expected: expectedDemandSum, actual: actualDemandInMap },
      expectedDemandSum === actualDemandInMap
    );

    return { demandMap, capacityMap };
  }

  /**
   * Generate matrix data points from maps
   */
  private static generateDataPoints(
    skills: SkillType[],
    months: MonthInfo[],
    demandMap: Map<string, Map<string, DemandDataPoint>>,
    capacityMap: Map<string, Map<string, number>>
  ): MatrixDataPoint[] {
    const dataPoints: MatrixDataPoint[] = [];
    
    for (const skill of skills) {
      const skillKey = String(skill).trim();
      for (const month of months) {
        const demandPoint = demandMap.get(month.key)?.get(skillKey);
        const demandHours = demandPoint?.demandHours || 0;
        const capacityHours = capacityMap.get(month.key)?.get(skillKey) || 0;
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

    // Enhanced debugging - Log data point generation
    MatrixDebugLogger.logDataPointGeneration(skills, months, demandMap, capacityMap, dataPoints);

    return dataPoints;
  }

  /**
   * Calculate matrix totals
   */
  private static calculateTotals(dataPoints: MatrixDataPoint[]) {
    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalCapacity = dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const totalGap = totalDemand - totalCapacity;

    return { totalDemand, totalCapacity, totalGap };
  }

  /**
   * Validate transformation and log results
   */
  private static validateAndLogTransformation(demandMatrix: DemandMatrixData, matrixData: MatrixData) {
    // VALIDATION CHECKPOINT: Final data integrity
    MatrixDebugLogger.logValidationCheckpoint(
      'Final Data Integrity',
      { 
        originalTotalDemand: demandMatrix.totalDemand, 
        transformedTotalDemand: matrixData.totalDemand,
        preserved: demandMatrix.totalDemand === matrixData.totalDemand
      },
      demandMatrix.totalDemand === matrixData.totalDemand
    );

    // Enhanced debugging - Log transformation completion
    MatrixDebugLogger.logTransformationComplete(demandMatrix, matrixData);
  }

  /**
   * Combine demand matrix data with capacity forecast data (legacy support)
   */
  static combineDemandAndCapacity(demandMatrix: any, capacityForecast: any[]) {
    const months = demandMatrix.months;
    
    // Build demand map by month and skill from unified demand matrix
    const demandByMonth = new Map();
    demandMatrix.dataPoints.forEach((dp: any) => {
      const monthMap = demandByMonth.get(dp.month) || new Map();
      monthMap.set(dp.skillType, (monthMap.get(dp.skillType) || 0) + dp.demandHours);
      demandByMonth.set(dp.month, monthMap);
    });
    
    // Construct combined forecast array
    return months.map((month: any) => {
      const demandMap = demandByMonth.get(month.key) || new Map();
      const demand = Array.from(demandMap.entries()).map(([skill, hours]) => ({ skill, hours }));
      const capacityPeriod = capacityForecast.find(p => p.period === month.key);
      const capacity = capacityPeriod?.capacity || [];
      
      return {
        period: month.key,
        demand,
        capacity
      };
    });
  }
}
