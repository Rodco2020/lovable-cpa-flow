
import { DemandDataPoint } from '@/types/demand';
import { TransformationContext } from './types';
import { CalculationEngine } from './calculationEngine';
import { PerformanceOptimizer } from '../performanceOptimizer';

/**
 * Data Point Builder
 * Handles the creation of data points with staff information
 */
export class DataPointBuilder {
  /**
   * Build data points with staff information preserved
   */
  static async buildDataPointsWithStaff(
    context: TransformationContext
  ): Promise<DemandDataPoint[]> {
    const { forecastData, tasks, months, skills, staffInformation } = context;
    const dataPoints: DemandDataPoint[] = [];
    
    await PerformanceOptimizer.processBatched(
      months,
      async (monthBatch) => {
        const monthResults: DemandDataPoint[] = [];
        
        for (const month of monthBatch) {
          for (const skill of skills) {
            const demandForSkillMonth = CalculationEngine.calculateDemandForSkillMonth(
              forecastData, 
              tasks, 
              skill, 
              month.key,
              staffInformation
            );
            
            if (demandForSkillMonth.demandHours > 0 || demandForSkillMonth.taskBreakdown.length > 0) {
              monthResults.push({
                skillType: skill,
                month: month.key,
                monthLabel: month.label,
                ...demandForSkillMonth
              });
            }
          }
        }
        
        return monthResults;
      }
    ).then(results => {
      dataPoints.push(...results.flat());
    });
    
    console.log(`📊 [DATA POINTS WITH STAFF] Generated data points:`, {
      totalDataPoints: dataPoints.length,
      dataPointsWithStaff: dataPoints.filter(dp => 
        dp.taskBreakdown?.some(task => task.preferredStaffId)
      ).length,
      sampleStaffTask: dataPoints
        .flatMap(dp => dp.taskBreakdown || [])
        .find(task => task.preferredStaffId)
    });
    
    return dataPoints;
  }
}
