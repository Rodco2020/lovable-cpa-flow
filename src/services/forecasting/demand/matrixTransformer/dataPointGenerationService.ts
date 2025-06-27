
import { debugLog } from '../../logger';
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
import { DemandCalculationService } from './demandCalculationService';
import { PeriodProcessingService } from './periodProcessingService';
import { suggestedRevenueCalculator } from '../calculators/SuggestedRevenueCalculator';
import { RevenueEnhancedDataPointContext } from './types';

/**
 * Enhanced Data Point Generation Service
 * Now includes revenue calculations during data point generation
 */
export class DataPointGenerationService {
  /**
   * Generate data points with skill mapping and revenue calculations
   */
  static async generateDataPointsWithSkillMapping(
    context: RevenueEnhancedDataPointContext
  ): Promise<DemandDataPoint[]> {
    const { forecastData, tasks, skills, skillMapping, revenueContext, revenueCalculationConfig } = context;
    
    debugLog('Generating data points with enhanced revenue calculations', {
      periodsCount: forecastData.length,
      skillsCount: skills.length,
      tasksCount: tasks.length,
      revenueEnabled: revenueCalculationConfig?.enabled || false
    });

    try {
      const dataPoints: DemandDataPoint[] = [];
      const months = PeriodProcessingService.generateMonthsFromForecast(forecastData);

      console.log(`📊 [DATA POINTS] Generating ${months.length} × ${skills.length} data points with enhanced recurrence calculations`);

      // Generate data points for each month-skill combination
      for (const month of months) {
        for (const skill of skills) {
          try {
            const dataPoint = await this.generateSingleDataPoint(
              month,
              skill,
              forecastData,
              tasks,
              skillMapping,
              revenueContext
            );
            
            if (dataPoint) {
              dataPoints.push(dataPoint);
            }
          } catch (error) {
            console.warn(`⚠️ [DATA POINTS] Error generating data point for ${month.key}/${skill}:`, error);
            // Continue with other data points rather than failing
            const fallbackDataPoint = this.createFallbackDataPoint(month, skill);
            dataPoints.push(fallbackDataPoint);
          }
        }
      }

      console.log(`✅ [DATA POINTS] Generated ${dataPoints.length} data points with enhanced recurrence calculations`);
      return dataPoints;

    } catch (error) {
      console.error('❌ [DATA POINTS] Error generating data points:', error);
      return [];
    }
  }

  /**
   * Generate a single data point with revenue calculations
   */
  private static async generateSingleDataPoint(
    month: { key: string; label: string; startDate: Date; endDate: Date },
    skill: string,
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>,
    revenueContext?: any
  ): Promise<DemandDataPoint | null> {
    try {
      // Find matching forecast period
      const forecastPeriod = forecastData.find(period => {
        return period.period === month.key;
      });

      if (!forecastPeriod) {
        return null;
      }

      // Calculate demand using existing logic (now enhanced with proper recurrence calculation)
      const demandCalculation = DemandCalculationService.calculateDemandForSkillPeriod(
        skill,
        forecastPeriod,
        tasks,
        skillMapping
      );

      // Generate task breakdown with client resolution
      const taskBreakdown = await this.generateTaskBreakdown(
        skill,
        forecastPeriod,
        tasks,
        skillMapping
      );

      // Calculate revenue if enabled
      let suggestedRevenue = 0;
      let expectedLessSuggested = 0;

      if (revenueContext?.includeRevenueCalculations && revenueContext.skillFeeRates) {
        try {
          suggestedRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
            demandCalculation.totalDemand,
            skill,
            revenueContext.skillFeeRates
          );

          // For now, set expectedLessSuggested to 0 - will be calculated at client level
          expectedLessSuggested = 0;

          console.log(`💰 [DATA POINT] ${month.key}/${skill}: ${demandCalculation.totalDemand}h × fee rate = $${suggestedRevenue}`);
        } catch (revenueError) {
          console.warn(`⚠️ [DATA POINT] Error calculating revenue for ${month.key}/${skill}:`, revenueError);
          // Continue with zero revenue rather than failing
        }
      }

      const dataPoint: DemandDataPoint = {
        skillType: skill,
        month: month.key,
        monthLabel: month.label,
        demandHours: demandCalculation.totalDemand,
        taskCount: demandCalculation.totalTasks,
        clientCount: demandCalculation.totalClients,
        taskBreakdown,
        suggestedRevenue,
        expectedLessSuggested
      };

      return dataPoint;

    } catch (error) {
      console.error(`❌ [DATA POINT] Error generating data point for ${month.key}/${skill}:`, error);
      return null;
    }
  }

  /**
   * Generate task breakdown for a data point with enhanced client resolution
   * Includes preferred staff information from tasks
   */
  private static async generateTaskBreakdown(
    skill: string,
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    const taskBreakdown: ClientTaskDemand[] = [];

    try {
      // Filter tasks by skill using the skill mapping
      const skillTasks = tasks.filter(task => {
        const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
        return taskSkills.some(taskSkill => {
          const mappedSkill = skillMapping.get(taskSkill);
          return mappedSkill === skill || taskSkill === skill;
        });
      });

      for (const task of skillTasks) {
        try {
          // Resolve client information using the available method
          const clientIds = [task.client_id];
          const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIds);
          const clientInfo = clientResolutionMap.get(task.client_id);
          
          if (!clientInfo) {
            console.warn(`⚠️ [TASK BREAKDOWN] Could not resolve client for task ${task.id}`);
            continue;
          }

          // Calculate monthly demand for this task using enhanced calculation
          const monthlyDemand = DemandCalculationService.calculateMonthlyDemandForTask(
            task,
            forecastPeriod
          );

          if (monthlyDemand.monthlyHours > 0) {
            // Include preferred staff information from the task
            const taskDemand: ClientTaskDemand = {
              clientId: task.client_id,
              clientName: clientInfo,
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: skill,
              estimatedHours: task.estimated_hours,
              recurrencePattern: {
                type: task.recurrence_type,
                interval: task.recurrence_interval || 1,
                frequency: monthlyDemand.monthlyOccurrences
              },
              monthlyHours: monthlyDemand.monthlyHours,
              preferredStaffId: task.preferred_staff_id || null,
              preferredStaffName: task.staff?.full_name || null
            };

            taskBreakdown.push(taskDemand);
          }
        } catch (taskError) {
          console.warn(`⚠️ [TASK BREAKDOWN] Error processing task ${task.id}:`, taskError);
          // Continue with other tasks
        }
      }

      return taskBreakdown;

    } catch (error) {
      console.error('❌ [TASK BREAKDOWN] Error generating task breakdown:', error);
      return [];
    }
  }

  /**
   * Create a fallback data point when generation fails
   */
  private static createFallbackDataPoint(
    month: { key: string; label: string },
    skill: string
  ): DemandDataPoint {
    return {
      skillType: skill,
      month: month.key,
      monthLabel: month.label,
      demandHours: 0,
      taskCount: 0,
      clientCount: 0,
      taskBreakdown: [],
      suggestedRevenue: 0,
      expectedLessSuggested: 0
    };
  }
}
