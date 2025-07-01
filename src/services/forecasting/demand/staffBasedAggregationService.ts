
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from './clientResolutionService';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';
import { MonthlyDemandCalculationService } from './matrixTransformer/monthlyDemandCalculationService';
import { debugLog } from '../logger';

interface StaffMember {
  id: string;
  name: string;
}

/**
 * Staff-Based Aggregation Service - FIXED
 * 
 * Fixed to group tasks by staff ID only (not staff+skill combination)
 * This ensures each staff member shows their individual tasks, not all tasks for their skill type.
 */
export class StaffBasedAggregationService {
  
  /**
   * FIXED: Group tasks by staff ID only for true individual staff filtering
   */
  static groupTasksByStaffAndSkill(
    tasks: RecurringTaskDB[],
    forecastPeriod: ForecastData,
    staffMembers: StaffMember[]
  ): Map<string, RecurringTaskDB[]> {
    const groupedTasks = new Map<string, RecurringTaskDB[]>();

    debugLog(`🔧 [STAFF AGGREGATION] FIXED: Grouping tasks by staff ID only for period: ${forecastPeriod.period}`);

    for (const task of tasks) {
      if (!task.preferred_staff_id) {
        continue; // Skip tasks without preferred staff
      }

      // Check if task should appear in this month
      const shouldAppear = MonthlyDemandCalculationService.shouldTaskAppearInMonth(task, forecastPeriod.period);
      if (!shouldAppear) {
        continue;
      }

      // Find the staff member for this task
      const staffMember = staffMembers.find(staff => staff.id === task.preferred_staff_id);
      if (!staffMember) {
        debugLog(`⚠️ [STAFF AGGREGATION] Staff member not found for task ${task.id}, preferred_staff_id: ${task.preferred_staff_id}`);
        continue;
      }

      // FIXED: Group by staff ID only (not staff+skill combination)
      const groupKey = task.preferred_staff_id; // Changed from: `${normalizedStaffId}_${mappedSkill}`
      
      if (!groupedTasks.has(groupKey)) {
        groupedTasks.set(groupKey, []);
      }
      
      groupedTasks.get(groupKey)!.push(task);
      
      debugLog(`✅ [STAFF AGGREGATION] FIXED: Task "${task.name}" grouped under staff ID: ${groupKey} (${staffMember.name})`);
    }

    debugLog(`🎯 [STAFF AGGREGATION] FIXED: Grouped ${tasks.length} tasks into ${groupedTasks.size} staff groups:`, {
      totalTasks: tasks.length,
      staffGroups: groupedTasks.size,
      groupKeys: Array.from(groupedTasks.keys()),
      taskDistribution: Array.from(groupedTasks.entries()).map(([staffId, tasks]) => {
        const staff = staffMembers.find(s => s.id === staffId);
        return {
          staffId,
          staffName: staff?.name || 'Unknown',
          taskCount: tasks.length
        };
      })
    });

    return groupedTasks;
  }

  /**
   * FIXED: Generate staff-specific data points with individual task filtering
   */
  static async generateStaffSpecificDataPoints(
    forecastPeriods: ForecastData[],
    allTasks: RecurringTaskDB[],
    staffMembers: StaffMember[]
  ): Promise<DemandDataPoint[]> {
    const dataPoints: DemandDataPoint[] = [];

    debugLog(`🚀 [STAFF AGGREGATION] FIXED: Generating staff-specific data points for ${staffMembers.length} staff members across ${forecastPeriods.length} periods`);

    // Batch resolve client information
    const allClientIds = [...new Set(allTasks.map(task => task.client_id))];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(allClientIds);

    for (const forecastPeriod of forecastPeriods) {
      // FIXED: Group tasks by individual staff members only
      const groupedTasks = this.groupTasksByStaffAndSkill(allTasks, forecastPeriod, staffMembers);
      
      for (const [staffId, staffTasks] of groupedTasks.entries()) {
        const staffMember = staffMembers.find(s => s.id === staffId);
        if (!staffMember) {
          debugLog(`⚠️ [STAFF AGGREGATION] Staff member not found for ID: ${staffId}`);
          continue;
        }

        // FIXED: Calculate individual staff member's demand for this period
        let totalDemand = 0;
        const taskBreakdown: ClientTaskDemand[] = [];

        for (const task of staffTasks) {
          // Verify this task is actually for this specific staff member
          if (task.preferred_staff_id !== staffId) {
            debugLog(`⚠️ [STAFF AGGREGATION] Task ${task.id} has wrong preferred_staff_id: expected ${staffId}, got ${task.preferred_staff_id}`);
            continue;
          }

          const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, forecastPeriod.period);
          
          if (monthlyDemand.monthlyHours > 0) {
            totalDemand += monthlyDemand.monthlyHours;
            
            const clientInfo = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
            
            taskBreakdown.push({
              clientId: task.client_id,
              clientName: clientInfo,
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: staffMember.name, // FIXED: Use staff name, not skill type
              estimatedHours: task.estimated_hours,
              recurrencePattern: {
                type: task.recurrence_type || 'monthly',
                interval: task.recurrence_interval || 1,
                frequency: monthlyDemand.monthlyOccurrences
              },
              monthlyHours: monthlyDemand.monthlyHours,
              preferredStaffId: task.preferred_staff_id,
              preferredStaffName: staffMember.name
            });
          }
        }

        // Only create data point if there's actual demand
        if (totalDemand > 0 && taskBreakdown.length > 0) {
          const dataPoint = this.createStaffSpecificDataPoint(
            staffMember,
            forecastPeriod,
            totalDemand,
            taskBreakdown
          );
          
          dataPoints.push(dataPoint);
          
          debugLog(`✅ [STAFF AGGREGATION] FIXED: Created data point for ${staffMember.name} in ${forecastPeriod.period}:`, {
            staffId: staffMember.id,
            staffName: staffMember.name,
            period: forecastPeriod.period,
            totalDemand,
            taskCount: taskBreakdown.length,
            uniqueClients: new Set(taskBreakdown.map(t => t.clientId)).size
          });
        }
      }
    }

    debugLog(`🎯 [STAFF AGGREGATION] FIXED: Generated ${dataPoints.length} staff-specific data points total`);
    return dataPoints;
  }

  /**
   * FIXED: Create individual staff-specific data point
   */
  private static createStaffSpecificDataPoint(
    staffMember: StaffMember,
    forecastPeriod: ForecastData,
    totalDemand: number,
    taskBreakdown: ClientTaskDemand[]
  ): DemandDataPoint {
    return {
      skillType: staffMember.name, // FIXED: Use staff name as the "skill type" for display
      month: forecastPeriod.period,
      monthLabel: forecastPeriod.period,
      demandHours: totalDemand,
      totalHours: totalDemand,
      taskCount: taskBreakdown.length,
      clientCount: new Set(taskBreakdown.map(t => t.clientId)).size,
      taskBreakdown,
      // FIXED: Staff-specific identification
      isStaffSpecific: true,
      actualStaffId: staffMember.id,
      actualStaffName: staffMember.name
    };
  }

  /**
   * FIXED: Resolve staff members with proper UUID handling
   */
  static async resolveStaffMembers(staffIds: string[]): Promise<StaffMember[]> {
    try {
      debugLog(`🔍 [STAFF AGGREGATION] FIXED: Resolving ${staffIds.length} staff members:`, staffIds);
      
      const allStaff = await UuidResolutionService.getAllStaff();
      const resolvedStaff: StaffMember[] = [];

      for (const staffId of staffIds) {
        const staff = allStaff.find(s => s.id === staffId);
        if (staff) {
          resolvedStaff.push({
            id: staff.id,
            name: staff.full_name
          });
          debugLog(`✅ [STAFF AGGREGATION] FIXED: Resolved staff ${staffId} -> ${staff.full_name}`);
        } else {
          debugLog(`⚠️ [STAFF AGGREGATION] FIXED: Could not resolve staff ID: ${staffId}`);
          // Add fallback with truncated ID
          resolvedStaff.push({
            id: staffId,
            name: `Staff ${staffId.substring(0, 8)}...`
          });
        }
      }

      debugLog(`🎯 [STAFF AGGREGATION] FIXED: Successfully resolved ${resolvedStaff.length} staff members`);
      return resolvedStaff;
    } catch (error) {
      console.error('❌ [STAFF AGGREGATION] FIXED: Error resolving staff members:', error);
      // Return fallback staff members
      return staffIds.map(id => ({
        id,
        name: `Staff ${id.substring(0, 8)}...`
      }));
    }
  }

  /**
   * FIXED: Filter tasks for specific staff members only
   */
  static filterTasksForStaff(
    tasks: RecurringTaskDB[],
    staffIds: string[]
  ): RecurringTaskDB[] {
    const filteredTasks = tasks.filter(task => 
      task.preferred_staff_id && staffIds.includes(task.preferred_staff_id)
    );

    debugLog(`🔍 [STAFF AGGREGATION] FIXED: Filtered tasks for staff members:`, {
      originalTasks: tasks.length,
      filteredTasks: filteredTasks.length,
      staffIds,
      tasksPerStaff: staffIds.map(staffId => ({
        staffId,
        taskCount: filteredTasks.filter(t => t.preferred_staff_id === staffId).length
      }))
    });

    return filteredTasks;
  }
}
