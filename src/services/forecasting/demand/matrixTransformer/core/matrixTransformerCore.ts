
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientRevenueCalculator } from '../clientRevenueCalculator';
import { SkillFeeRateManager } from '../skillFeeRateManager';
import { PerformanceOptimizer } from '../performanceOptimizer';
import { DataExtractors } from './dataExtractors';
import { DataPointBuilder } from './dataPointBuilder';
import { SummaryBuilders } from './summaryBuilders';
import { RevenueEnhancer } from './revenueEnhancer';
import { MatrixValidator } from './matrixValidator';
import { TransformationContext } from './types';
import { debugLog } from '../../../logger';

/**
 * Matrix Transformer Core Implementation
 * Refactored for improved maintainability and modularity
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with staff information preservation
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    const monitor = PerformanceOptimizer.createPerformanceMonitor('Matrix Transformation');
    monitor.start();

    try {
      // Phase 1: Validate and prepare data
      monitor.checkpoint('Data Validation');
      if (!forecastData?.length || !tasks?.length) {
        console.warn('Empty forecast data or tasks provided');
        return this.createEmptyMatrix();
      }

      console.log(`🔄 [MATRIX TRANSFORMER] Starting transformation:`, {
        forecastDataLength: forecastData.length,
        tasksLength: tasks.length,
        sampleForecastEntry: forecastData[0],
        sampleTask: tasks[0]
      });

      // Phase 2: Extract foundational data
      monitor.checkpoint('Foundation Data Extraction');
      const context = await this.buildTransformationContext(forecastData, tasks);
      
      console.log(`📊 [MATRIX TRANSFORMER] Foundation data extracted:`, {
        monthsCount: context.months.length,
        skillsCount: context.skills.length,
        staffCount: context.staffInformation.length,
        tasksCount: tasks.length
      });

      // Phase 3: Build data points with staff information
      monitor.checkpoint('Data Points Generation');
      const dataPoints = await DataPointBuilder.buildDataPointsWithStaff(context);
      
      console.log(`📈 [MATRIX TRANSFORMER] Data points generated:`, {
        dataPointsCount: dataPoints.length,
        sampleDataPoint: dataPoints[0],
        totalDemandHours: dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0)
      });

      // Phase 4: Enhance with revenue calculations
      monitor.checkpoint('Revenue Calculations');
      const dataPointsWithRevenue = await RevenueEnhancer.enhanceDataPointsWithRevenue(dataPoints);

      // Phase 5: Build comprehensive summaries
      monitor.checkpoint('Summary Generation');
      const summaries = this.buildMatrixSummaries(dataPointsWithRevenue);

      // Phase 6: Assemble final matrix
      monitor.checkpoint('Matrix Assembly');
      const matrixData = this.assembleMatrixData(
        context,
        dataPointsWithRevenue,
        summaries
      );

      // Phase 7: Validate result
      const validationResult = MatrixValidator.validateMatrixData(matrixData);
      if (!validationResult.isValid) {
        console.warn('⚠️ [MATRIX TRANSFORM] Data validation issues:', validationResult.issues);
      }

      const metrics = monitor.finish();
      this.logTransformationComplete(matrixData, metrics);

      return matrixData;

    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER] Error during transformation:', error);
      return this.createEmptyMatrix();
    }
  }

  /**
   * Build transformation context from raw data
   */
  private static async buildTransformationContext(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<TransformationContext> {
    const months = DataExtractors.extractMonths(forecastData);
    const skills = DataExtractors.extractSkills(forecastData);
    const optimizedTasks = PerformanceOptimizer.optimizeDataStructures(tasks);
    const staffInformation = DataExtractors.extractStaffInformation(optimizedTasks);

    return {
      forecastData,
      tasks: optimizedTasks,
      months,
      skills,
      staffInformation
    };
  }

  /**
   * Build comprehensive summaries from enhanced data points
   */
  private static buildMatrixSummaries(dataPoints: any[]) {
    const skillSummary = SummaryBuilders.buildSkillSummary(dataPoints);
    const staffSummary = SummaryBuilders.buildStaffSummary(dataPoints);
    const clientMaps = SummaryBuilders.buildClientMaps(dataPoints);
    const revenueTotals = SummaryBuilders.calculateRevenueTotals(dataPoints);

    return {
      skillSummary,
      staffSummary,
      clientMaps,
      revenueTotals
    };
  }

  /**
   * Assemble final matrix data structure
   */
  private static assembleMatrixData(
    context: TransformationContext,
    dataPoints: any[],
    summaries: any
  ): DemandMatrixData {
    return {
      months: context.months,
      skills: context.skills,
      dataPoints,
      totalDemand: dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
      totalTasks: dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
      totalClients: new Set(dataPoints.flatMap(dp => 
        dp.taskBreakdown?.map((task: any) => task.clientId) || []
      )).size,
      skillSummary: summaries.skillSummary,
      clientTotals: summaries.clientMaps.clientTotals,
      clientRevenue: summaries.clientMaps.clientRevenue,
      clientHourlyRates: summaries.clientMaps.clientHourlyRates,
      clientSuggestedRevenue: summaries.clientMaps.clientSuggestedRevenue,
      clientExpectedLessSuggested: summaries.clientMaps.clientExpectedLessSuggested,
      skillFeeRates: new Map(), // Will be populated by RevenueEnhancer
      revenueTotals: summaries.revenueTotals,
      staffSummary: summaries.staffSummary,
      availableStaff: context.staffInformation
    };
  }

  /**
   * Create empty matrix data structure
   */
  private static createEmptyMatrix(): DemandMatrixData {
    return {
      months: [],
      skills: [],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {},
      clientTotals: new Map(),
      clientRevenue: new Map(),
      clientHourlyRates: new Map(),
      clientSuggestedRevenue: new Map(),
      clientExpectedLessSuggested: new Map(),
      skillFeeRates: new Map(),
      revenueTotals: {
        totalSuggestedRevenue: 0,
        totalExpectedRevenue: 0,
        totalExpectedLessSuggested: 0
      },
      staffSummary: {},
      availableStaff: []
    };
  }

  /**
   * Log transformation completion with metrics
   */
  private static logTransformationComplete(matrixData: DemandMatrixData, metrics: any): void {
    console.log(`✅ [MATRIX TRANSFORMER] Transformation completed successfully:`, {
      processingTime: `${metrics.duration.toFixed(2)}ms`,
      finalDataPoints: matrixData.dataPoints.length,
      totalDemand: matrixData.totalDemand,
      totalClients: matrixData.totalClients,
      totalStaff: matrixData.availableStaff?.length || 0,
      revenueCalculationEnabled: !!matrixData.revenueTotals,
      memoryUsage: `${(metrics.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB peak`
    });
  }
}
