import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { normalizeStaffId } from '@/utils/staffIdUtils';
import { debugLog } from '../../logger';

/**
 * Staff-Based Aggregation Service
 * 
 * Creates separate data points for individual staff members instead of aggregating by skill type.
 * This fixes the critical bug where staff filtering returned entire skill groups.
 */
export class StaffBasedAggregationService {
  /**
   * Generate staff-specific data points for a given period
   */
  static async generateStaffSpecificDataPoints(
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint[]> {
    debugLog(`Generating staff-specific data points for period: ${forecastPeriod.period}`);
    
    const staffDataPoints: DemandDataPoint[] = [];
    
    // Group tasks by staff member and skill combination
    const staffSkillGroups = await this.groupTasksByStaffAndSkill(tasks, forecastPeriod, skillMapping);
    
    // Create data points for each staff-skill combination
    for (const [groupKey, taskGroup] of staffSkillGroups.entries()) {
      const { staffId, staffName, skillType, tasks: groupTasks } = taskGroup;
      
      try {
        const dataPoint = await this.createStaffSpecificDataPoint(
          forecastPeriod,
          staffId,
          staffName,
          skillType,
          groupTasks,
          skillMapping
        );
        
        if (dataPoint) {
          staffDataPoints.push(dataPoint);
        }
      } catch (error) {
        console.error(`Error creating staff-specific data point for ${staffName} (${skillType}):`, error);
      }
    }
    
    // Also create data points for unassigned tasks by skill
    const unassignedDataPoints = await this.createUnassignedTaskDataPoints(
      forecastPeriod,
      tasks,
      skillMapping
    );
    
    staffDataPoints.push(...unassignedDataPoints);
    
    console.log(`✅ [STAFF AGGREGATION] Generated ${staffDataPoints.length} staff-specific data points`);
    return staffDataPoints;
  }
  
  /**
   * Group tasks by staff member and skill combination
   */
  private static async groupTasksByStaffAndSkill(
    tasks: RecurringTaskDB[],
    forecastPeriod: ForecastData,
    skillMapping: Map<string, string>
  ) {
    const staffSkillGroups = new Map<string, {
      staffId: string;
      staffName: string;
      skillType: string;
      tasks: RecurringTaskDB[];
    }>();
    
    for (const task of tasks) {
      // Skip tasks without staff assignment or required skills
      if (!task.preferred_staff_id || !task.required_skills?.length) {
        continue;
      }
      
      const normalizedStaffId = normalizeStaffId(task.preferred_staff_id);
      if (!normalizedStaffId) continue;
      
      // Get the primary skill and map it
      const primarySkill = task.required_skills[0];
      const mappedSkill = skillMapping.get(primarySkill) || primarySkill;
      
      // Create unique key for staff-skill combination
      const groupKey = `${normalizedStaffId}_${mappedSkill}`;
      
      if (!staffSkillGroups.has(groupKey)) {
        staffSkillGroups.set(groupKey, {
          staffId: normalizedStaffId,
          staffName: task.staff?.full_name || 'Unknown Staff',
          skillType: mappedSkill,
          tasks: []
        });
      }
      
      staffSkillGroups.get(groupKey)!.tasks.push(task);
    }
    
    return staffSkillGroups;
  }
  
  /**
   * Create a data point for a specific staff member and skill combination
   */
  private static async createStaffSpecificDataPoint(
    forecastPeriod: ForecastData,
    staffId: string,
    staffName: string,
    skillType: string,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint | null> {
    if (tasks.length === 0) return null;
    
    let totalDemand = 0;
    const taskBreakdown: ClientTaskDemand[] = [];
    const clientsSet = new Set<string>();
    
    // Collect unique client IDs for batch resolution
    const clientIds = [...new Set(tasks.map(task => task.client_id))];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIds);
    
    for (const task of tasks) {
      try {
        const clientInfo = clientResolutionMap.get(task.client_id);
        if (!clientInfo) continue;
        
        // Calculate monthly demand for this task
        const periodDate = new Date(forecastPeriod.period + '-01');
        const startDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
        const endDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);
        
        const monthlyDemand = RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);
        
        if (monthlyDemand.monthlyHours > 0) {
          totalDemand += monthlyDemand.monthlyHours;
          clientsSet.add(task.client_id);
          
          const taskDemand: ClientTaskDemand = {
            clientId: task.client_id,
            clientName: clientInfo,
            recurringTaskId: task.id,
            taskName: task.name,
            skillType: skillType,
            estimatedHours: task.estimated_hours,
            recurrencePattern: {
              type: task.recurrence_type,
              interval: task.recurrence_interval || 1,
              frequency: monthlyDemand.monthlyOccurrences
            },
            monthlyHours: monthlyDemand.monthlyHours,
            preferredStaffId: staffId,
            preferredStaffName: staffName
          };
          
          taskBreakdown.push(taskDemand);
        }
      } catch (error) {
        console.warn(`Error processing task ${task.id} for staff ${staffName}:`, error);
      }
    }
    
    if (totalDemand === 0) return null;
    
    // Create staff-specific skillType identifier
    const staffSpecificSkillType = `${staffName} (${skillType})`;
    
    const periodDate = new Date(forecastPeriod.period + '-01');
    
    return {
      skillType: staffSpecificSkillType,
      month: forecastPeriod.period,
      monthLabel: periodDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      demandHours: totalDemand,
      totalHours: totalDemand, // Add required property
      taskCount: taskBreakdown.length,
      clientCount: clientsSet.size,
      taskBreakdown: taskBreakdown,
      isStaffSpecific: true,
      actualStaffId: staffId,
      actualStaffName: staffName,
      underlyingSkillType: skillType
    };
  }
  
  /**
   * Create data points for unassigned tasks (grouped by skill)
   */
  private static async createUnassignedTaskDataPoints(
    forecastPeriod: ForecastData,
    allTasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint[]> {
    // Filter tasks without staff assignment
    const unassignedTasks = allTasks.filter(task => 
      !task.preferred_staff_id && task.required_skills?.length > 0
    );
    
    if (unassignedTasks.length === 0) return [];
    
    // Group by skill type
    const skillGroups = new Map<string, RecurringTaskDB[]>();
    
    for (const task of unassignedTasks) {
      const primarySkill = task.required_skills[0];
      const mappedSkill = skillMapping.get(primarySkill) || primarySkill;
      
      if (!skillGroups.has(mappedSkill)) {
        skillGroups.set(mappedSkill, []);
      }
      skillGroups.get(mappedSkill)!.push(task);
    }
    
    const unassignedDataPoints: DemandDataPoint[] = [];
    
    for (const [skillType, tasks] of skillGroups.entries()) {
      const dataPoint = await this.createUnassignedSkillDataPoint(
        forecastPeriod,
        skillType,
        tasks
      );
      
      if (dataPoint) {
        unassignedDataPoints.push(dataPoint);
      }
    }
    
    return unassignedDataPoints;
  }
  
  /**
   * Create a data point for unassigned tasks of a specific skill
   */
  private static async createUnassignedSkillDataPoint(
    forecastPeriod: ForecastData,
    skillType: string,
    tasks: RecurringTaskDB[]
  ): Promise<DemandDataPoint | null> {
    if (tasks.length === 0) return null;
    
    let totalDemand = 0;
    const taskBreakdown: ClientTaskDemand[] = [];
    const clientsSet = new Set<string>();
    
    // Collect unique client IDs for batch resolution
    const clientIds = [...new Set(tasks.map(task => task.client_id))];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIds);
    
    for (const task of tasks) {
      try {
        const clientInfo = clientResolutionMap.get(task.client_id);
        if (!clientInfo) continue;
        
        // Calculate monthly demand
        const periodDate = new Date(forecastPeriod.period + '-01');
        const startDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
        const endDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);
        
        const monthlyDemand = RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);
        
        if (monthlyDemand.monthlyHours > 0) {
          totalDemand += monthlyDemand.monthlyHours;
          clientsSet.add(task.client_id);
          
          const taskDemand: ClientTaskDemand = {
            clientId: task.client_id,
            clientName: clientInfo,
            recurringTaskId: task.id,
            taskName: task.name,
            skillType: skillType,
            estimatedHours: task.estimated_hours,
            recurrencePattern: {
              type: task.recurrence_type,
              interval: task.recurrence_interval || 1,
              frequency: monthlyDemand.monthlyOccurrences
            },
            monthlyHours: monthlyDemand.monthlyHours,
            preferredStaffId: null,
            preferredStaffName: null
          };
          
          taskBreakdown.push(taskDemand);
        }
      } catch (error) {
        console.warn(`Error processing unassigned task ${task.id}:`, error);
      }
    }
    
    if (totalDemand === 0) return null;
    
    // Create unassigned skill identifier
    const unassignedSkillType = `Unassigned (${skillType})`;
    
    const periodDate = new Date(forecastPeriod.period + '-01');
    
    return {
      skillType: unassignedSkillType,
      month: forecastPeriod.period,
      monthLabel: periodDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      demandHours: totalDemand,
      totalHours: totalDemand, // Add required property
      taskCount: taskBreakdown.length,
      clientCount: clientsSet.size,
      taskBreakdown: taskBreakdown,
      isStaffSpecific: false,
      isUnassigned: true,
      underlyingSkillType: skillType
    };
  }
}
