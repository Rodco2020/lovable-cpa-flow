import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { normalizeStaffId } from '@/utils/staffIdUtils';
import { debugLog } from '../../logger';

/**
 * Staff-Based Aggregation Service - ENHANCED WITH CRITICAL DEBUGGING
 * 
 * Creates separate data points for individual staff members instead of aggregating by skill type.
 * This fixes the critical bug where staff filtering returned entire skill groups.
 */
export class StaffBasedAggregationService {
  /**
   * Generate staff-specific data points for a given period
   * ENHANCED: Critical debugging to find why Marciano's data is missing
   */
  static async generateStaffSpecificDataPoints(
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint[]> {
    console.log(`🔍 [CRITICAL DEBUG - STAFF AGGREGATION] ========= GENERATING STAFF DATA POINTS FOR ${forecastPeriod.period} =========`);
    
    debugLog(`Generating staff-specific data points for period: ${forecastPeriod.period}`);
    
    const staffDataPoints: DemandDataPoint[] = [];
    
    // CRITICAL: First, let's see what tasks we're working with
    console.log(`📋 [CRITICAL DEBUG - STAFF AGGREGATION] Input Analysis:`, {
      totalTasks: tasks.length,
      tasksWithStaffAssignment: tasks.filter(t => t.preferred_staff_id).length,
      tasksWithoutStaffAssignment: tasks.filter(t => !t.preferred_staff_id).length,
      uniqueStaffIds: [...new Set(tasks.map(t => t.preferred_staff_id).filter(Boolean))],
      skillMappingSize: skillMapping.size
    });

    // CRITICAL: Check for Marciano specifically
    const marcianoTasks = tasks.filter(task => 
      task.staff?.full_name?.toLowerCase().includes('marciano') ||
      task.preferred_staff_id === '1' || // Common ID for first staff member
      String(task.preferred_staff_id).toLowerCase().includes('marciano')
    );
    
    console.log(`👨‍💼 [CRITICAL DEBUG - STAFF AGGREGATION] MARCIANO TASK SEARCH:`, {
      marcianoTasksFound: marcianoTasks.length,
      marcianoTaskDetails: marcianoTasks.map(task => ({
        id: task.id,
        name: task.name,
        preferred_staff_id: task.preferred_staff_id,
        staff_full_name: task.staff?.full_name,
        client_id: task.client_id,
        required_skills: task.required_skills,
        estimated_hours: task.estimated_hours
      }))
    });
    
    // Group tasks by staff member and skill combination
    const staffSkillGroups = await this.groupTasksByStaffAndSkill(tasks, forecastPeriod, skillMapping);
    
    console.log(`🎯 [CRITICAL DEBUG - STAFF AGGREGATION] Staff-Skill Grouping Results:`, {
      totalGroups: staffSkillGroups.size,
      groupDetails: Array.from(staffSkillGroups.entries()).map(([groupKey, group]) => ({
        groupKey,
        staffId: group.staffId,
        staffName: group.staffName,
        skillType: group.skillType,
        taskCount: group.tasks.length,
        isMarcianoGroup: group.staffName?.toLowerCase().includes('marciano') || false
      }))
    });
    
    // Create data points for each staff-skill combination
    for (const [groupKey, taskGroup] of staffSkillGroups.entries()) {
      const { staffId, staffName, skillType, tasks: groupTasks } = taskGroup;
      
      console.log(`⚙️ [CRITICAL DEBUG - STAFF AGGREGATION] Processing group: ${groupKey}`, {
        staffId,
        staffName,
        skillType,
        taskCount: groupTasks.length,
        isMarcianoGroup: staffName?.toLowerCase().includes('marciano') || false
      });
      
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
          console.log(`✅ [CRITICAL DEBUG - STAFF AGGREGATION] Created data point:`, {
            skillType: dataPoint.skillType,
            demandHours: dataPoint.demandHours,
            taskCount: dataPoint.taskCount,
            isStaffSpecific: dataPoint.isStaffSpecific,
            actualStaffId: dataPoint.actualStaffId,
            actualStaffName: dataPoint.actualStaffName,
            underlyingSkillType: dataPoint.underlyingSkillType,
            isMarcianoDataPoint: dataPoint.actualStaffName?.toLowerCase().includes('marciano') || false
          });
          
          staffDataPoints.push(dataPoint);
        } else {
          console.log(`❌ [CRITICAL DEBUG - STAFF AGGREGATION] No data point created for group: ${groupKey}`);
        }
      } catch (error) {
        console.error(`❌ [CRITICAL DEBUG - STAFF AGGREGATION] Error creating staff-specific data point for ${staffName} (${skillType}):`, error);
      }
    }
    
    // Also create data points for unassigned tasks by skill
    console.log(`🔄 [CRITICAL DEBUG - STAFF AGGREGATION] Processing unassigned tasks...`);
    const unassignedDataPoints = await this.createUnassignedTaskDataPoints(
      forecastPeriod,
      tasks,
      skillMapping
    );
    
    console.log(`📊 [CRITICAL DEBUG - STAFF AGGREGATION] Unassigned data points:`, {
      count: unassignedDataPoints.length,
      details: unassignedDataPoints.map(dp => ({
        skillType: dp.skillType,
        demandHours: dp.demandHours,
        taskCount: dp.taskCount
      }))
    });
    
    staffDataPoints.push(...unassignedDataPoints);
    
    console.log(`🏁 [CRITICAL DEBUG - STAFF AGGREGATION] ========= FINAL RESULTS FOR ${forecastPeriod.period} =========`);
    console.log(`🏁 [CRITICAL DEBUG - STAFF AGGREGATION] Generated ${staffDataPoints.length} staff-specific data points`);
    
    // CRITICAL: Show the actual structure of all data points
    console.log(`📋 [CRITICAL DEBUG - STAFF AGGREGATION] ALL DATA POINTS STRUCTURE:`, 
      staffDataPoints.map((dp, index) => ({
        index,
        skillType: dp.skillType,
        demandHours: dp.demandHours,
        taskCount: dp.taskCount,
        isStaffSpecific: dp.isStaffSpecific,
        actualStaffId: dp.actualStaffId,
        actualStaffName: dp.actualStaffName,
        underlyingSkillType: dp.underlyingSkillType,
        isMarcianoDataPoint: dp.actualStaffName?.toLowerCase().includes('marciano') || dp.skillType?.toLowerCase().includes('marciano') || false
      }))
    );
    
    // CRITICAL: Count Marciano data points in final results
    const marcianoDataPoints = staffDataPoints.filter(dp => 
      dp.actualStaffName?.toLowerCase().includes('marciano') ||
      dp.skillType?.toLowerCase().includes('marciano')
    );
    
    console.log(`👨‍💼 [CRITICAL DEBUG - STAFF AGGREGATION] MARCIANO DATA POINTS IN FINAL RESULTS:`, {
      marcianoDataPointCount: marcianoDataPoints.length,
      marcianoDataPointDetails: marcianoDataPoints.map(dp => ({
        skillType: dp.skillType,
        actualStaffName: dp.actualStaffName,
        demandHours: dp.demandHours,
        taskCount: dp.taskCount
      }))
    });
    
    return staffDataPoints;
  }
  
  /**
   * Group tasks by staff member and skill combination
   * ENHANCED: Critical debugging for staff grouping
   */
  private static async groupTasksByStaffAndSkill(
    tasks: RecurringTaskDB[],
    forecastPeriod: ForecastData,
    skillMapping: Map<string, string>
  ) {
    console.log(`🔄 [CRITICAL DEBUG - GROUPING] Starting staff-skill grouping for ${tasks.length} tasks`);
    
    const staffSkillGroups = new Map<string, {
      staffId: string;
      staffName: string;
      skillType: string;
      tasks: RecurringTaskDB[];
    }>();
    
    for (const task of tasks) {
      // CRITICAL: Debug each task processing
      console.log(`📋 [CRITICAL DEBUG - GROUPING] Processing task:`, {
        taskId: task.id,
        taskName: task.name,
        preferred_staff_id: task.preferred_staff_id,
        staff_full_name: task.staff?.full_name,
        required_skills: task.required_skills,
        hasStaffAssignment: !!task.preferred_staff_id,
        hasRequiredSkills: !!task.required_skills?.length
      });
      
      // Skip tasks without staff assignment or required skills
      if (!task.preferred_staff_id || !task.required_skills?.length) {
        console.log(`⚠️ [CRITICAL DEBUG - GROUPING] Skipping task - no staff assignment or skills`);
        continue;
      }
      
      const normalizedStaffId = normalizeStaffId(task.preferred_staff_id);
      if (!normalizedStaffId) {
        console.log(`⚠️ [CRITICAL DEBUG - GROUPING] Skipping task - invalid staff ID after normalization`);
        continue;
      }
      
      // Get the primary skill and map it
      const primarySkill = task.required_skills[0];
      const mappedSkill = skillMapping.get(primarySkill) || primarySkill;
      
      // Create unique key for staff-skill combination
      const groupKey = `${normalizedStaffId}_${mappedSkill}`;
      
      console.log(`🎯 [CRITICAL DEBUG - GROUPING] Task grouping:`, {
        taskId: task.id,
        normalizedStaffId,
        primarySkill,
        mappedSkill,
        groupKey,
        staffName: task.staff?.full_name,
        isMarcianoTask: task.staff?.full_name?.toLowerCase().includes('marciano') || false
      });
      
      if (!staffSkillGroups.has(groupKey)) {
        const staffName = task.staff?.full_name || 'Unknown Staff';
        console.log(`🆕 [CRITICAL DEBUG - GROUPING] Creating new group:`, {
          groupKey,
          staffId: normalizedStaffId,
          staffName,
          skillType: mappedSkill,
          isMarcianoGroup: staffName.toLowerCase().includes('marciano')
        });
        
        staffSkillGroups.set(groupKey, {
          staffId: normalizedStaffId,
          staffName,
          skillType: mappedSkill,
          tasks: []
        });
      }
      
      staffSkillGroups.get(groupKey)!.tasks.push(task);
      console.log(`➕ [CRITICAL DEBUG - GROUPING] Added task to group ${groupKey}, total tasks: ${staffSkillGroups.get(groupKey)!.tasks.length}`);
    }
    
    console.log(`🏁 [CRITICAL DEBUG - GROUPING] Grouping complete:`, {
      totalGroups: staffSkillGroups.size,
      groupSummary: Array.from(staffSkillGroups.entries()).map(([key, group]) => ({
        groupKey: key,
        staffName: group.staffName,
        skillType: group.skillType,
        taskCount: group.tasks.length,
        isMarcianoGroup: group.staffName.toLowerCase().includes('marciano')
      }))
    });
    
    return staffSkillGroups;
  }
  
  /**
   * Create a data point for a specific staff member and skill combination
   * ENHANCED: Critical debugging for data point creation
   */
  private static async createStaffSpecificDataPoint(
    forecastPeriod: ForecastData,
    staffId: string,
    staffName: string,
    skillType: string,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint | null> {
    console.log(`🔨 [CRITICAL DEBUG - DATA POINT CREATION] Creating data point for:`, {
      staffId,
      staffName,
      skillType,
      taskCount: tasks.length,
      isMarcianoDataPoint: staffName.toLowerCase().includes('marciano')
    });
    
    if (tasks.length === 0) {
      console.log(`❌ [CRITICAL DEBUG - DATA POINT CREATION] No tasks provided, returning null`);
      return null;
    }
    
    let totalDemand = 0;
    const taskBreakdown: ClientTaskDemand[] = [];
    const clientsSet = new Set<string>();
    
    // Collect unique client IDs for batch resolution
    const clientIds = [...new Set(tasks.map(task => task.client_id))];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIds);
    
    console.log(`👥 [CRITICAL DEBUG - DATA POINT CREATION] Client resolution:`, {
      uniqueClientIds: clientIds,
      resolvedClients: clientIds.length,
      clientResolutionMapSize: clientResolutionMap.size
    });
    
    for (const task of tasks) {
      console.log(`📋 [CRITICAL DEBUG - DATA POINT CREATION] Processing task in data point:`, {
        taskId: task.id,
        taskName: task.name,
        clientId: task.client_id,
        estimated_hours: task.estimated_hours,
        recurrence_type: task.recurrence_type
      });
      
      try {
        const clientInfo = clientResolutionMap.get(task.client_id);
        if (!clientInfo) {
          console.log(`⚠️ [CRITICAL DEBUG - DATA POINT CREATION] No client info found for task ${task.id}`);
          continue;
        }
        
        // Calculate monthly demand for this task
        const periodDate = new Date(forecastPeriod.period + '-01');
        const startDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
        const endDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);
        
        const monthlyDemand = RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);
        
        console.log(`📊 [CRITICAL DEBUG - DATA POINT CREATION] Monthly demand calculation:`, {
          taskId: task.id,
          monthlyHours: monthlyDemand.monthlyHours,
          monthlyOccurrences: monthlyDemand.monthlyOccurrences,
          periodDate: forecastPeriod.period
        });
        
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
          
          console.log(`✅ [CRITICAL DEBUG - DATA POINT CREATION] Added task demand to breakdown:`, {
            taskName: taskDemand.taskName,
            clientName: taskDemand.clientName,
            monthlyHours: taskDemand.monthlyHours,
            preferredStaffName: taskDemand.preferredStaffName
          });
          
          taskBreakdown.push(taskDemand);
        } else {
          console.log(`⚠️ [CRITICAL DEBUG - DATA POINT CREATION] Task has 0 monthly demand, skipping`);
        }
      } catch (error) {
        console.warn(`❌ [CRITICAL DEBUG - DATA POINT CREATION] Error processing task ${task.id} for staff ${staffName}:`, error);
      }
    }
    
    if (totalDemand === 0) {
      console.log(`❌ [CRITICAL DEBUG - DATA POINT CREATION] Total demand is 0, returning null`);
      return null;
    }
    
    // Create staff-specific skillType identifier
    const staffSpecificSkillType = `${staffName} (${skillType})`;
    
    const periodDate = new Date(forecastPeriod.period + '-01');
    
    const dataPoint: DemandDataPoint = {
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
    
    console.log(`🎯 [CRITICAL DEBUG - DATA POINT CREATION] FINAL DATA POINT CREATED:`, {
      skillType: dataPoint.skillType,
      month: dataPoint.month,
      demandHours: dataPoint.demandHours,
      taskCount: dataPoint.taskCount,
      isStaffSpecific: dataPoint.isStaffSpecific,
      actualStaffId: dataPoint.actualStaffId,
      actualStaffName: dataPoint.actualStaffName,
      underlyingSkillType: dataPoint.underlyingSkillType,
      isMarcianoDataPoint: dataPoint.actualStaffName?.toLowerCase().includes('marciano') || false
    });
    
    return dataPoint;
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
