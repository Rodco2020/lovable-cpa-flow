
import { DemandMatrixData } from '@/types/demand';
import { debugLog } from '../../logger';
import { format, parse } from 'date-fns';
import { SkillResolutionService } from '../skillResolution/skillResolutionService';
import { MatrixTransformerDebugger } from './matrixTransformerDebugger';

/**
 * Matrix Transformer Core with Enhanced Debugging and Fixed Calculations
 * Core logic for transforming forecast and task data into matrix format
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast and task data to matrix data format
   */
  static async transformToMatrixData(forecastData: any[], tasks: any[]): Promise<DemandMatrixData> {
    debugLog('🚀 Starting matrix transformation with enhanced debugging', {
      forecastPeriods: forecastData.length,
      tasksCount: tasks.length
    });

    try {
      // Extract months from forecast data
      const months = forecastData.map(period => ({
        key: period.period,
        label: period.periodLabel || format(parse(period.period, 'yyyy-MM', new Date()), 'MMM yyyy')
      }));

      debugLog('📅 Extracted months:', months);

      // Filter for active tasks only
      const activeTasks = tasks.filter(task => task.is_active && task.status !== 'Archived');
      debugLog(`📝 Filtered to ${activeTasks.length} active tasks from ${tasks.length} total`);

      // Extract and resolve skills from tasks
      const allSkillReferences = new Set<string>();
      
      activeTasks.forEach(task => {
        if (Array.isArray(task.required_skills)) {
          task.required_skills.forEach((skill: string) => {
            if (skill && typeof skill === 'string') {
              allSkillReferences.add(skill.trim());
            }
          });
        }
      });

      debugLog('🎯 Collected skill references:', Array.from(allSkillReferences));

      // Resolve skill UUIDs to names
      const skillRefsArray = Array.from(allSkillReferences);
      const resolvedSkillNames = await SkillResolutionService.getSkillNames(skillRefsArray);
      
      // Create mapping for quick lookup
      const skillMapping = new Map<string, string>();
      for (let i = 0; i < skillRefsArray.length; i++) {
        skillMapping.set(skillRefsArray[i], resolvedSkillNames[i]);
      }

      const uniqueSkills = Array.from(new Set(resolvedSkillNames)).filter(name => name && name.length > 0);

      debugLog('✅ Skill resolution complete:', {
        originalRefs: skillRefsArray.length,
        resolvedNames: resolvedSkillNames.length,
        uniqueSkills: uniqueSkills.length
      });

      // Generate data points for each skill-month combination
      const dataPoints: any[] = [];
      
      for (const skillName of uniqueSkills) {
        for (const month of months) {
          // Debug task processing for this skill-month combination
          const skillTasks = activeTasks.filter(task => {
            if (!Array.isArray(task.required_skills)) return false;
            
            return task.required_skills.some((skillRef: string) => {
              const resolvedName = skillMapping.get(skillRef);
              return resolvedName === skillName;
            });
          });

          if (skillTasks.length === 0) continue;

          // Debug the tasks for this combination
          console.log(`🔍 Processing ${skillTasks.length} tasks for skill "${skillName}" in month ${month.key}`);
          MatrixTransformerDebugger.debugTaskProcessing(skillTasks, month.key);

          // Calculate monthly hours for each task based on recurrence - ENHANCED
          const taskBreakdown = skillTasks.map(task => {
            const monthlyHours = this.calculateEnhancedMonthlyHours(task, month.key);
            
            return {
              clientId: task.client_id,
              clientName: task.clients?.legal_name || 'Unknown Client',
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: skillName,
              estimatedHours: task.estimated_hours || 0,
              recurrencePattern: this.extractRecurrencePattern(task),
              monthlyHours,
              preferredStaff: task.preferred_staff ? {
                staffId: task.preferred_staff.id,
                staffName: task.preferred_staff.full_name,
                roleTitle: task.preferred_staff.role_title
              } : undefined
            };
          }).filter(task => task.monthlyHours > 0);

          console.log(`📊 Task breakdown for ${skillName}/${month.key}:`, taskBreakdown);

          const demandHours = taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
          const taskCount = taskBreakdown.length;
          const uniqueClients = new Set(taskBreakdown.map(task => task.clientId));

          // Only add data points with actual demand
          if (demandHours > 0 || taskCount > 0) {
            const dataPoint = {
              skillType: skillName,
              month: month.key,
              monthLabel: month.label,
              demandHours,
              taskCount,
              clientCount: uniqueClients.size,
              taskBreakdown
            };

            console.log(`➕ Adding data point:`, {
              skill: skillName,
              month: month.key,
              hours: demandHours,
              tasks: taskCount,
              clients: uniqueClients.size
            });

            dataPoints.push(dataPoint);
          }
        }
      }

      // Calculate totals
      const totalDemand = dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const totalTasks = dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
      const allClientIds = new Set<string>();
      dataPoints.forEach(point => {
        point.taskBreakdown.forEach((task: any) => allClientIds.add(task.clientId));
      });

      const matrixData: DemandMatrixData = {
        months,
        skills: uniqueSkills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients: allClientIds.size,
        skillSummary: this.generateSkillSummary(dataPoints, uniqueSkills)
      };

      // Debug the final matrix data
      MatrixTransformerDebugger.debugMatrixAggregation(matrixData);

      debugLog('✅ Matrix transformation complete:', {
        monthsCount: months.length,
        skillsCount: uniqueSkills.length,
        dataPointsCount: dataPoints.length,
        totalDemand,
        totalTasks,
        totalClients: allClientIds.size
      });

      return matrixData;

    } catch (error) {
      console.error('❌ Error in matrix transformation:', error);
      
      // Return minimal data structure to prevent crashes
      return {
        months: forecastData.map(period => ({
          key: period.period,
          label: period.periodLabel || format(parse(period.period, 'yyyy-MM', new Date()), 'MMM yyyy')
        })),
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }
  }

  /**
   * Enhanced monthly hours calculation with better recurrence handling
   */
  private static calculateEnhancedMonthlyHours(task: any, monthKey: string): number {
    const estimatedHours = task.estimated_hours || 0;
    
    if (!task.recurrence_type || task.recurrence_type === 'None') {
      console.log(`⚠️ Task "${task.name}" has no recurrence (${task.recurrence_type}), returning 0 hours`);
      return 0;
    }

    if (estimatedHours <= 0) {
      console.log(`⚠️ Task "${task.name}" has no estimated hours (${estimatedHours}), returning 0 hours`);
      return 0;
    }

    const interval = task.recurrence_interval || 1;
    
    let monthlyHours = 0;
    switch (task.recurrence_type) {
      case 'Daily':
        // Daily tasks: estimated hours * days per month / interval
        monthlyHours = estimatedHours * (30 / interval);
        break;
      case 'Weekly':
        // Weekly tasks: estimated hours * weeks per month / interval
        monthlyHours = estimatedHours * (4.33 / interval); // More accurate weeks per month
        break;
      case 'Monthly':
        // Monthly tasks: estimated hours / interval
        monthlyHours = estimatedHours / interval;
        break;
      case 'Quarterly':
        // Quarterly tasks: estimated hours / 3 months / interval
        monthlyHours = estimatedHours / (3 * interval);
        break;
      case 'Annually':
        // Annual tasks: estimated hours / 12 months / interval
        monthlyHours = estimatedHours / (12 * interval);
        break;
      default:
        console.warn(`⚠️ Unknown recurrence type: ${task.recurrence_type}, using estimated hours`);
        monthlyHours = estimatedHours;
    }

    console.log(`📈 Task "${task.name}": ${estimatedHours}h ${task.recurrence_type}/${interval} → ${monthlyHours.toFixed(2)}h/month`);
    return Math.round(monthlyHours * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Extract recurrence pattern information from task
   */
  private static extractRecurrencePattern(task: any): any {
    return {
      type: task.recurrence_type || 'None',
      interval: task.recurrence_interval || 1,
      frequency: this.calculateFrequency(task.recurrence_type, task.recurrence_interval)
    };
  }

  /**
   * Calculate frequency per month for recurrence pattern
   */
  private static calculateFrequency(recurrenceType: string, interval: number): number {
    switch (recurrenceType) {
      case 'Daily':
        return 30 / (interval || 1);
      case 'Weekly':
        return 4.33 / (interval || 1); // More accurate
      case 'Monthly':
        return 1 / (interval || 1);
      case 'Quarterly':
        return 1 / ((interval || 1) * 3);
      case 'Annually':
        return 1 / ((interval || 1) * 12);
      default:
        return 0;
    }
  }

  /**
   * Generate skill summary statistics
   */
  private static generateSkillSummary(dataPoints: any[], skills: string[]): Record<string, any> {
    const skillSummary: Record<string, any> = {};

    skills.forEach(skill => {
      const skillPoints = dataPoints.filter(point => point.skillType === skill);
      const totalDemand = skillPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const totalTasks = skillPoints.reduce((sum, point) => sum + point.taskCount, 0);
      const totalClients = new Set(
        skillPoints.flatMap(point => point.taskBreakdown.map((task: any) => task.clientId))
      ).size;

      skillSummary[skill] = {
        totalDemand,
        totalTasks,
        totalClients,
        averageDemandPerMonth: skillPoints.length > 0 ? totalDemand / skillPoints.length : 0
      };
    });

    return skillSummary;
  }
}
