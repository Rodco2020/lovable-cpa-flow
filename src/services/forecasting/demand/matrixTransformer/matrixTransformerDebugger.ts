
import { debugLog } from '../../logger';
import { RecurringTaskDB } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

/**
 * Matrix Transformer Debugger
 * Enhanced debugging utilities for the matrix transformation process
 */
export class MatrixTransformerDebugger {
  /**
   * Debug task data processing and recurrence calculations
   */
  static debugTaskProcessing(tasks: RecurringTaskDB[], monthKey: string) {
    console.group(`🔍 [MATRIX DEBUG] Task Processing for ${monthKey}`);
    
    const taskAnalysis = tasks.map(task => {
      const monthlyHours = this.calculateMonthlyHours(task, monthKey);
      const recurrenceInfo = this.analyzeRecurrencePattern(task);
      
      return {
        taskId: task.id,
        taskName: task.name,
        clientId: task.client_id,
        estimatedHours: task.estimated_hours,
        recurrenceType: task.recurrence_type,
        recurrenceInterval: task.recurrence_interval,
        requiredSkills: task.required_skills,
        calculatedMonthlyHours: monthlyHours,
        recurrenceAnalysis: recurrenceInfo,
        isActive: task.is_active,
        status: task.status
      };
    });

    console.log(`📊 Processing ${tasks.length} tasks for month ${monthKey}:`);
    console.table(taskAnalysis);
    
    // Analyze skill distribution
    const skillDistribution = this.analyzeSkillDistribution(tasks);
    console.log(`🎯 Skill Distribution:`, skillDistribution);
    
    // Analyze recurrence patterns
    const recurrencePatterns = this.analyzeRecurrencePatterns(tasks);
    console.log(`🔄 Recurrence Patterns:`, recurrencePatterns);
    
    console.groupEnd();
    
    return taskAnalysis;
  }

  /**
   * Calculate monthly hours for a task (extracted from core for debugging)
   */
  private static calculateMonthlyHours(task: RecurringTaskDB, monthKey: string): number {
    const estimatedHours = task.estimated_hours || 0;
    
    if (!task.recurrence_type || task.recurrence_type === 'None') {
      console.log(`⚠️ Task ${task.name} has no recurrence, returning 0 hours`);
      return 0;
    }

    const interval = task.recurrence_interval || 1;
    
    let result = 0;
    switch (task.recurrence_type) {
      case 'Daily':
        result = estimatedHours * 30 / interval;
        break;
      case 'Weekly':
        result = estimatedHours * 4 / interval;
        break;
      case 'Monthly':
        result = estimatedHours / interval;
        break;
      case 'Quarterly':
        result = interval === 3 ? estimatedHours / 3 : 0;
        break;
      case 'Annually':
        result = interval === 12 ? estimatedHours / 12 : 0;
        break;
      default:
        result = estimatedHours;
    }

    console.log(`📈 Task ${task.name} (${task.recurrence_type}/${interval}): ${estimatedHours}h → ${result}h/month`);
    return result;
  }

  /**
   * Analyze recurrence pattern for debugging
   */
  private static analyzeRecurrencePattern(task: RecurringTaskDB) {
    return {
      type: task.recurrence_type || 'None',
      interval: task.recurrence_interval || 1,
      frequency: this.calculateFrequency(task.recurrence_type, task.recurrence_interval),
      isValid: this.validateRecurrencePattern(task)
    };
  }

  /**
   * Calculate frequency per month
   */
  private static calculateFrequency(recurrenceType: string | null, interval: number | null): number {
    if (!recurrenceType || !interval) return 0;
    
    switch (recurrenceType) {
      case 'Daily':
        return 30 / interval;
      case 'Weekly':
        return 4 / interval;
      case 'Monthly':
        return 1 / interval;
      case 'Quarterly':
        return 1 / (interval * 3);
      case 'Annually':
        return 1 / (interval * 12);
      default:
        return 0;
    }
  }

  /**
   * Validate recurrence pattern
   */
  private static validateRecurrencePattern(task: RecurringTaskDB): boolean {
    if (!task.recurrence_type || task.recurrence_type === 'None') {
      return true; // Ad-hoc tasks are valid
    }

    const interval = task.recurrence_interval || 1;
    return interval > 0 && task.estimated_hours !== null && task.estimated_hours > 0;
  }

  /**
   * Analyze skill distribution across tasks
   */
  private static analyzeSkillDistribution(tasks: RecurringTaskDB[]) {
    const skillCounts = new Map<string, number>();
    
    tasks.forEach(task => {
      if (Array.isArray(task.required_skills)) {
        task.required_skills.forEach(skill => {
          if (skill && typeof skill === 'string') {
            skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
          }
        });
      }
    });

    return Object.fromEntries(skillCounts);
  }

  /**
   * Analyze recurrence patterns across tasks
   */
  private static analyzeRecurrencePatterns(tasks: RecurringTaskDB[]) {
    const patternCounts = new Map<string, number>();
    
    tasks.forEach(task => {
      const pattern = `${task.recurrence_type || 'None'}/${task.recurrence_interval || 1}`;
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    });

    return Object.fromEntries(patternCounts);
  }

  /**
   * Debug matrix data aggregation
   */
  static debugMatrixAggregation(matrixData: DemandMatrixData) {
    console.group(`🔍 [MATRIX DEBUG] Matrix Data Aggregation Analysis`);
    
    console.log(`📊 Matrix Summary:`, {
      totalDataPoints: matrixData.dataPoints.length,
      totalDemand: matrixData.totalDemand,
      totalTasks: matrixData.totalTasks,
      totalClients: matrixData.totalClients,
      monthsCount: matrixData.months.length,
      skillsCount: matrixData.skills.length
    });

    // Analyze data points by skill
    const skillAnalysis = new Map<string, {totalHours: number, totalTasks: number, months: number}>();
    
    matrixData.dataPoints.forEach(point => {
      if (!skillAnalysis.has(point.skillType)) {
        skillAnalysis.set(point.skillType, {totalHours: 0, totalTasks: 0, months: 0});
      }
      
      const skill = skillAnalysis.get(point.skillType)!;
      skill.totalHours += point.demandHours;
      skill.totalTasks += point.taskCount;
      skill.months += 1;
    });

    console.log(`🎯 Skill Analysis:`, Object.fromEntries(skillAnalysis));

    // Analyze data points by month
    const monthAnalysis = new Map<string, {totalHours: number, totalTasks: number, skills: number}>();
    
    matrixData.dataPoints.forEach(point => {
      if (!monthAnalysis.has(point.month)) {
        monthAnalysis.set(point.month, {totalHours: 0, totalTasks: 0, skills: 0});
      }
      
      const month = monthAnalysis.get(point.month)!;
      month.totalHours += point.demandHours;
      month.totalTasks += point.taskCount;
      month.skills += 1;
    });

    console.log(`📅 Month Analysis:`, Object.fromEntries(monthAnalysis));

    // Check for suspicious data points (1 task, 1 client consistently)
    const suspiciousPoints = matrixData.dataPoints.filter(point => 
      point.taskCount === 1 && point.clientCount === 1
    );

    if (suspiciousPoints.length > 0) {
      console.warn(`⚠️ Found ${suspiciousPoints.length} suspicious data points (1 task, 1 client):`);
      console.table(suspiciousPoints.slice(0, 10));
    }

    console.groupEnd();
  }

  /**
   * Debug task breakdown data
   */
  static debugTaskBreakdown(dataPoint: any) {
    if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
      console.warn(`⚠️ No task breakdown for ${dataPoint.skillType} in ${dataPoint.month}`);
      return;
    }

    console.group(`🔍 [TASK BREAKDOWN] ${dataPoint.skillType} - ${dataPoint.month}`);
    
    console.log(`📋 Task Breakdown (${dataPoint.taskBreakdown.length} tasks):`);
    console.table(dataPoint.taskBreakdown.map((task: any) => ({
      taskName: task.taskName,
      clientName: task.clientName,
      monthlyHours: task.monthlyHours,
      estimatedHours: task.estimatedHours,
      recurrencePattern: `${task.recurrencePattern?.type}/${task.recurrencePattern?.interval}`
    })));

    console.groupEnd();
  }
}
