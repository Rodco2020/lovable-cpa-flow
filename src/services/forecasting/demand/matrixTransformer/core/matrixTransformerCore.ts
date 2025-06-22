
import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientRevenueCalculator } from '../clientRevenueCalculator';
import { SkillFeeRateManager } from '../skillFeeRateManager';
import { PerformanceOptimizer } from '../performanceOptimizer';
import { debugLog } from '../../../logger';

/**
 * Matrix Transformer Core Implementation
 * Handles the core transformation logic from forecast data to matrix format
 */
export class MatrixTransformerCore {
  private static readonly DEFAULT_ESTIMATED_HOURS = 1;
  private static readonly FALLBACK_FEE_RATE = 150;

  /**
   * Enhanced: Transform forecast data to matrix format with staff information preservation
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    const monitor = PerformanceOptimizer.createPerformanceMonitor('Matrix Transformation');
    monitor.start();

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

    // Phase 2: Extract and prepare foundational data
    monitor.checkpoint('Foundation Data Extraction');
    const months = this.extractMonths(forecastData);
    const skills = this.extractSkills(forecastData);
    const optimizedTasks = PerformanceOptimizer.optimizeDataStructures(tasks);
    
    // Enhanced: Extract staff information from tasks using correct field names
    const staffInformation = this.extractStaffInformation(optimizedTasks);
    
    console.log(`📊 [MATRIX TRANSFORMER] Foundation data extracted:`, {
      monthsCount: months.length,
      skillsCount: skills.length,
      staffCount: staffInformation.length,
      tasksCount: optimizedTasks.length
    });

    // Phase 3: Build data points with enhanced task breakdown including staff
    monitor.checkpoint('Data Points Generation');
    const dataPoints = await this.buildDataPointsWithStaff(forecastData, optimizedTasks, months, skills, staffInformation);
    
    console.log(`📈 [MATRIX TRANSFORMER] Data points generated:`, {
      dataPointsCount: dataPoints.length,
      sampleDataPoint: dataPoints[0],
      totalDemandHours: dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0)
    });

    // Phase 4: Calculate revenue using enhanced calculators
    monitor.checkpoint('Revenue Calculations');
    const { revenueCalculator, skillFeeRates } = await this.initializeRevenueComponents();
    const dataPointsWithRevenue = await this.enhanceDataPointsWithRevenue(
      dataPoints, 
      revenueCalculator, 
      skillFeeRates
    );

    // Phase 5: Build comprehensive summaries
    monitor.checkpoint('Summary Generation');
    const skillSummary = this.buildSkillSummary(dataPointsWithRevenue);
    const clientMaps = this.buildClientMaps(dataPointsWithRevenue);
    const revenueTotals = this.calculateRevenueTotals(dataPointsWithRevenue);
    
    // Enhanced: Build staff summary
    const staffSummary = this.buildStaffSummary(dataPointsWithRevenue);

    // Phase 6: Assemble final matrix
    monitor.checkpoint('Matrix Assembly');
    const matrixData: DemandMatrixData = {
      months,
      skills,
      dataPoints: dataPointsWithRevenue,
      totalDemand: dataPointsWithRevenue.reduce((sum, dp) => sum + dp.demandHours, 0),
      totalTasks: dataPointsWithRevenue.reduce((sum, dp) => sum + dp.taskCount, 0),
      totalClients: new Set(dataPointsWithRevenue.flatMap(dp => 
        dp.taskBreakdown?.map(task => task.clientId) || []
      )).size,
      skillSummary,
      clientTotals: clientMaps.clientTotals,
      clientRevenue: clientMaps.clientRevenue,
      clientHourlyRates: clientMaps.clientHourlyRates,
      clientSuggestedRevenue: clientMaps.clientSuggestedRevenue,
      clientExpectedLessSuggested: clientMaps.clientExpectedLessSuggested,
      skillFeeRates,
      revenueTotals,
      staffSummary, // Enhanced: Include staff summary
      availableStaff: staffInformation // Enhanced: Include available staff for filtering
    };

    const metrics = monitor.finish();
    
    console.log(`✅ [MATRIX TRANSFORMER] Transformation completed successfully:`, {
      processingTime: `${metrics.duration.toFixed(2)}ms`,
      finalDataPoints: matrixData.dataPoints.length,
      totalDemand: matrixData.totalDemand,
      totalClients: matrixData.totalClients,
      totalStaff: matrixData.availableStaff?.length || 0, // Enhanced: Log staff count
      revenueCalculationEnabled: !!matrixData.revenueTotals,
      memoryUsage: `${(metrics.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB peak`
    });

    return matrixData;
  }

  /**
   * Enhanced: Extract staff information from tasks using correct database field names
   */
  private static extractStaffInformation(tasks: RecurringTaskDB[]): Array<{ id: string; name: string }> {
    const staffMap = new Map<string, string>();
    
    tasks.forEach(task => {
      // Use correct database field names (snake_case)
      if (task.preferred_staff_id) {
        // For now, use the staff ID as the name since we don't have a separate name field
        // This should be enhanced to lookup actual staff names from staff table
        staffMap.set(task.preferred_staff_id, `Staff ${task.preferred_staff_id.slice(0, 8)}`);
      }
    });
    
    const staffArray = Array.from(staffMap.entries()).map(([id, name]) => ({ id, name }));
    
    console.log(`👥 [STAFF EXTRACTION] Extracted staff information:`, {
      uniqueStaffCount: staffArray.length,
      staffList: staffArray
    });
    
    return staffArray;
  }

  /**
   * Enhanced: Build data points with staff information preserved
   */
  private static async buildDataPointsWithStaff(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    months: Array<{ key: string; label: string }>,
    skills: string[],
    staffInformation: Array<{ id: string; name: string }>
  ): Promise<DemandDataPoint[]> {
    const dataPoints: DemandDataPoint[] = [];
    
    await PerformanceOptimizer.processBatched(
      months,
      async (monthBatch) => {
        const monthResults: DemandDataPoint[] = [];
        
        for (const month of monthBatch) {
          for (const skill of skills) {
            const demandForSkillMonth = this.calculateDemandForSkillMonth(
              forecastData, 
              tasks, 
              skill, 
              month.key,
              staffInformation // Enhanced: Pass staff information
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

  /**
   * Enhanced: Calculate demand for skill/month with staff information using correct field names
   */
  private static calculateDemandForSkillMonth(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skill: string,
    month: string,
    staffInformation: Array<{ id: string; name: string }>
  ): Pick<DemandDataPoint, 'demandHours' | 'taskCount' | 'clientCount' | 'taskBreakdown'> {
    // Filter tasks using correct field names and handle array skills
    const relevantTasks = tasks.filter(task => {
      // Check if the skill is in the required_skills array and task is active
      const hasSkill = task.required_skills && Array.isArray(task.required_skills) && 
                      task.required_skills.includes(skill);
      const isActive = task.status === 'Unscheduled' || task.is_active === true; // Use correct status check
      return hasSkill && isActive;
    });
    
    let demandHours = 0;
    let taskCount = 0;
    const clientIds = new Set<string>();
    const taskBreakdown: ClientTaskDemand[] = [];
    
    // Enhanced: Create staff lookup for efficient name resolution
    const staffLookup = new Map(staffInformation.map(staff => [staff.id, staff.name]));
    
    relevantTasks.forEach(task => {
      const monthlyHours = this.calculateMonthlyHours(task, month);
      
      if (monthlyHours > 0) {
        demandHours += monthlyHours;
        taskCount++;
        clientIds.add(task.client_id); // Use correct field name
        
        // Enhanced: Include staff information in task breakdown using correct field names
        taskBreakdown.push({
          clientId: task.client_id, // Use correct field name
          clientName: `Client ${task.client_id.slice(0, 8)}`, // Generate name from ID for now
          recurringTaskId: task.id,
          taskName: task.name, // Use correct field name
          skillType: skill,
          estimatedHours: task.estimated_hours || this.DEFAULT_ESTIMATED_HOURS, // Use correct field name
          recurrencePattern: {
            type: task.recurrence_type || 'monthly', // Use correct field name
            interval: task.recurrence_interval || 1, // Use correct field name
            frequency: 1
          },
          monthlyHours,
          preferredStaffId: task.preferred_staff_id, // Use correct field name
          preferredStaffName: task.preferred_staff_id ? staffLookup.get(task.preferred_staff_id) : undefined
        });
      }
    });
    
    return {
      demandHours,
      taskCount,
      clientCount: clientIds.size,
      taskBreakdown
    };
  }

  /**
   * Enhanced: Build staff summary for matrix data
   */
  private static buildStaffSummary(dataPoints: DemandDataPoint[]): { [key: string]: any } {
    const staffSummary: { [key: string]: any } = {};
    
    dataPoints.forEach(dataPoint => {
      dataPoint.taskBreakdown?.forEach(task => {
        if (task.preferredStaffId && task.preferredStaffName) {
          const staffKey = task.preferredStaffId;
          
          if (!staffSummary[staffKey]) {
            staffSummary[staffKey] = {
              staffId: task.preferredStaffId,
              staffName: task.preferredStaffName,
              totalHours: 0,
              taskCount: 0,
              clientCount: new Set<string>()
            };
          }
          
          staffSummary[staffKey].totalHours += task.monthlyHours;
          staffSummary[staffKey].taskCount += 1;
          staffSummary[staffKey].clientCount.add(task.clientId);
        }
      });
    });
    
    // Convert client count sets to numbers
    Object.keys(staffSummary).forEach(staffKey => {
      const clientCountSet = staffSummary[staffKey].clientCount;
      staffSummary[staffKey].clientCount = clientCountSet.size;
    });
    
    console.log(`👥 [STAFF SUMMARY] Built staff summary:`, {
      staffCount: Object.keys(staffSummary).length,
      sampleStaffEntry: Object.values(staffSummary)[0]
    });
    
    return staffSummary;
  }

  private static extractMonths(forecastData: ForecastData[]): Array<{ key: string; label: string }> {
    const months = new Set<string>();
    forecastData.forEach(item => {
      if (item.period) {
        months.add(item.period);
      }
    });
    
    return Array.from(months)
      .sort()
      .map(monthKey => ({
        key: monthKey,
        label: this.formatMonthLabel(monthKey)
      }));
  }

  private static extractSkills(forecastData: ForecastData[]): string[] {
    const skills = new Set<string>();
    forecastData.forEach(item => {
      item.demand?.forEach(d => {
        if (d.skill) {
          skills.add(d.skill);
        }
      });
    });
    
    return Array.from(skills).sort();
  }

  private static formatMonthLabel(monthKey: string): string {
    try {
      const date = new Date(monthKey);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return monthKey;
    }
  }

  private static calculateMonthlyHours(task: RecurringTaskDB, month: string): number {
    const estimatedHours = task.estimated_hours || this.DEFAULT_ESTIMATED_HOURS; // Use correct field name
    const recurrenceType = task.recurrence_type || 'monthly'; // Use correct field name
    const recurrenceInterval = task.recurrence_interval || 1; // Use correct field name
    
    switch (recurrenceType) {
      case 'weekly':
        return estimatedHours * 4.33 / recurrenceInterval;
      case 'monthly':
        return estimatedHours / recurrenceInterval;
      case 'quarterly':
        return estimatedHours / (3 * recurrenceInterval);
      case 'annually':
        return estimatedHours / (12 * recurrenceInterval);
      default:
        return estimatedHours;
    }
  }

  private static async initializeRevenueComponents() {
    const revenueCalculator = new ClientRevenueCalculator();
    const skillFeeRateManager = new SkillFeeRateManager();
    const skillFeeRates = await skillFeeRateManager.getSkillFeeRates();
    
    return { revenueCalculator, skillFeeRates };
  }

  private static async enhanceDataPointsWithRevenue(
    dataPoints: DemandDataPoint[],
    revenueCalculator: ClientRevenueCalculator,
    skillFeeRates: Map<string, number>
  ): Promise<DemandDataPoint[]> {
    return PerformanceOptimizer.processWithConcurrencyLimit(
      dataPoints,
      async (dataPoint) => {
        const suggestedRevenue = this.calculateSuggestedRevenue(dataPoint, skillFeeRates);
        const expectedRevenue = await revenueCalculator.getExpectedRevenue(dataPoint);
        const expectedLessSuggested = expectedRevenue - suggestedRevenue;
        
        const enhancedTaskBreakdown = dataPoint.taskBreakdown?.map(task => ({
          ...task,
          suggestedRevenue: (task.monthlyHours * (skillFeeRates.get(task.skillType) || this.FALLBACK_FEE_RATE))
        }));
        
        return {
          ...dataPoint,
          suggestedRevenue,
          expectedLessSuggested,
          taskBreakdown: enhancedTaskBreakdown
        };
      },
      5
    );
  }

  private static calculateSuggestedRevenue(dataPoint: DemandDataPoint, skillFeeRates: Map<string, number>): number {
    const feeRate = skillFeeRates.get(dataPoint.skillType) || this.FALLBACK_FEE_RATE;
    return dataPoint.demandHours * feeRate;
  }

  private static buildSkillSummary(dataPoints: DemandDataPoint[]): { [key: string]: any } {
    const skillSummary: { [key: string]: any } = {};
    
    dataPoints.forEach(dataPoint => {
      const skill = dataPoint.skillType;
      
      if (!skillSummary[skill]) {
        skillSummary[skill] = {
          totalHours: 0,
          taskCount: 0,
          clientCount: new Set<string>(),
          totalSuggestedRevenue: 0,
          totalExpectedLessSuggested: 0
        };
      }
      
      skillSummary[skill].totalHours += dataPoint.demandHours;
      skillSummary[skill].taskCount += dataPoint.taskCount;
      skillSummary[skill].totalSuggestedRevenue += dataPoint.suggestedRevenue || 0;
      skillSummary[skill].totalExpectedLessSuggested += dataPoint.expectedLessSuggested || 0;
      
      dataPoint.taskBreakdown?.forEach(task => {
        skillSummary[skill].clientCount.add(task.clientId);
      });
    });
    
    Object.keys(skillSummary).forEach(skill => {
      const summary = skillSummary[skill];
      summary.clientCount = summary.clientCount.size;
      summary.averageFeeRate = summary.totalHours > 0 ? 
        summary.totalSuggestedRevenue / summary.totalHours : 0;
    });
    
    return skillSummary;
  }

  private static buildClientMaps(dataPoints: DemandDataPoint[]) {
    const clientTotals = new Map<string, number>();
    const clientRevenue = new Map<string, number>();
    const clientHourlyRates = new Map<string, number>();
    const clientSuggestedRevenue = new Map<string, number>();
    const clientExpectedLessSuggested = new Map<string, number>();
    
    dataPoints.forEach(dataPoint => {
      dataPoint.taskBreakdown?.forEach(task => {
        const clientId = task.clientId;
        const currentHours = clientTotals.get(clientId) || 0;
        const currentSuggested = clientSuggestedRevenue.get(clientId) || 0;
        const taskSuggested = task.suggestedRevenue || 0;
        
        clientTotals.set(clientId, currentHours + task.monthlyHours);
        clientSuggestedRevenue.set(clientId, currentSuggested + taskSuggested);
      });
    });
    
    return {
      clientTotals,
      clientRevenue,
      clientHourlyRates,
      clientSuggestedRevenue,
      clientExpectedLessSuggested
    };
  }

  private static calculateRevenueTotals(dataPoints: DemandDataPoint[]) {
    const totalSuggestedRevenue = dataPoints.reduce((sum, dp) => sum + (dp.suggestedRevenue || 0), 0);
    const totalExpectedLessSuggested = dataPoints.reduce((sum, dp) => sum + (dp.expectedLessSuggested || 0), 0);
    const totalExpectedRevenue = totalSuggestedRevenue + totalExpectedLessSuggested;
    
    return {
      totalSuggestedRevenue,
      totalExpectedRevenue,
      totalExpectedLessSuggested
    };
  }

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
      staffSummary: {}, // Enhanced: Include empty staff summary
      availableStaff: [] // Enhanced: Include empty staff array
    };
  }
}
