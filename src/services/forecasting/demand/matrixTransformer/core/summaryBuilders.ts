
import { ClientMaps, RevenueTotals } from './types';

/**
 * Summary Builders - Phase 4 Enhanced
 * Handles summary calculations with unassigned task support
 */
export class SummaryBuilders {
  /**
   * Build skill summary with enhanced information
   */
  static buildSkillSummary(dataPoints: any[]): { [key: string]: any } {
    const skillSummary: { [key: string]: any } = {};
    
    dataPoints.forEach(point => {
      if (!skillSummary[point.skillType]) {
        skillSummary[point.skillType] = {
          totalHours: 0,
          totalTasks: 0,
          totalClients: 0,
          // Phase 4: Enhanced with assignment tracking
          unassignedHours: 0,
          assignedHours: 0,
          unassignedTasks: 0,
          assignedTasks: 0
        };
      }
      
      const summary = skillSummary[point.skillType];
      summary.totalHours += point.demandHours;
      summary.totalTasks += point.taskCount;
      summary.totalClients += point.clientCount;
      
      // Phase 4: Track assignment statistics
      if (point.unassignedHours !== undefined) {
        summary.unassignedHours += point.unassignedHours;
      }
      if (point.assignedHours !== undefined) {
        summary.assignedHours += point.assignedHours;
      }
      
      // Count unassigned vs assigned tasks
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach((task: any) => {
          if (task.isUnassigned) {
            summary.unassignedTasks += 1;
          } else {
            summary.assignedTasks += 1;
          }
        });
      }
    });
    
    console.log('📊 [PHASE 4] Enhanced skill summary built:', {
      skillsCount: Object.keys(skillSummary).length,
      sampleSkill: Object.keys(skillSummary)[0],
      sampleData: skillSummary[Object.keys(skillSummary)[0]]
    });
    
    return skillSummary;
  }

  /**
   * Phase 4: Build staff summary with unassigned task handling
   */
  static buildStaffSummary(dataPoints: any[]): { [key: string]: any } {
    const staffSummary: { [key: string]: any } = {};
    
    // Initialize unassigned category
    staffSummary['UNASSIGNED'] = {
      staffId: 'UNASSIGNED',
      staffName: 'Unassigned Tasks',
      totalHours: 0,
      totalTasks: 0,
      skillBreakdown: {},
      clientBreakdown: {}
    };
    
    dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach((task: any) => {
          const staffKey = task.isUnassigned ? 'UNASSIGNED' : (task.preferredStaffId || 'UNKNOWN');
          
          if (!staffSummary[staffKey]) {
            staffSummary[staffKey] = {
              staffId: staffKey,
              staffName: task.isUnassigned ? 'Unassigned Tasks' : (task.staffInfo?.name || `Staff ${staffKey.slice(0, 8)}`),
              totalHours: 0,
              totalTasks: 0,
              skillBreakdown: {},
              clientBreakdown: {},
              isUnassigned: task.isUnassigned || false
            };
          }
          
          const summary = staffSummary[staffKey];
          summary.totalHours += task.monthlyHours || 0;
          summary.totalTasks += 1;
          
          // Build skill breakdown
          if (!summary.skillBreakdown[task.skillType]) {
            summary.skillBreakdown[task.skillType] = 0;
          }
          summary.skillBreakdown[task.skillType] += task.monthlyHours || 0;
          
          // Build client breakdown
          if (!summary.clientBreakdown[task.clientName]) {
            summary.clientBreakdown[task.clientName] = 0;
          }
          summary.clientBreakdown[task.clientName] += task.monthlyHours || 0;
        });
      }
    });
    
    console.log('👥 [PHASE 4] Enhanced staff summary built:', {
      staffCount: Object.keys(staffSummary).length,
      unassignedHours: staffSummary['UNASSIGNED']?.totalHours || 0,
      unassignedTasks: staffSummary['UNASSIGNED']?.totalTasks || 0
    });
    
    return staffSummary;
  }

  /**
   * Build client maps (unchanged)
   */
  static buildClientMaps(dataPoints: any[]): ClientMaps {
    const clientTotals = new Map<string, number>();
    const clientRevenue = new Map<string, number>();
    const clientHourlyRates = new Map<string, number>();
    const clientSuggestedRevenue = new Map<string, number>();
    const clientExpectedLessSuggested = new Map<string, number>();
    
    dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach((task: any) => {
          const clientName = task.clientName;
          const hours = task.monthlyHours || 0;
          
          clientTotals.set(clientName, (clientTotals.get(clientName) || 0) + hours);
          
          if (task.suggestedRevenue) {
            clientSuggestedRevenue.set(clientName, 
              (clientSuggestedRevenue.get(clientName) || 0) + task.suggestedRevenue
            );
          }
        });
      }
    });
    
    return {
      clientTotals,
      clientRevenue,
      clientHourlyRates,
      clientSuggestedRevenue,
      clientExpectedLessSuggested
    };
  }

  /**
   * Calculate revenue totals (unchanged)
   */
  static calculateRevenueTotals(dataPoints: any[]): RevenueTotals {
    let totalSuggestedRevenue = 0;
    let totalExpectedRevenue = 0;
    
    dataPoints.forEach(point => {
      if (point.suggestedRevenue) {
        totalSuggestedRevenue += point.suggestedRevenue;
      }
      if (point.expectedRevenue) {
        totalExpectedRevenue += point.expectedRevenue;
      }
    });
    
    return {
      totalSuggestedRevenue,
      totalExpectedRevenue,
      totalExpectedLessSuggested: totalExpectedRevenue - totalSuggestedRevenue
    };
  }

  /**
   * Phase 4: Build unassigned tasks summary
   */
  static buildUnassignedSummary(dataPoints: any[]): {
    totalUnassignedTasks: number;
    totalUnassignedHours: number;
    skillBreakdown: { [skill: string]: number };
  } {
    let totalUnassignedTasks = 0;
    let totalUnassignedHours = 0;
    const skillBreakdown: { [skill: string]: number } = {};
    
    dataPoints.forEach(point => {
      if (point.unassignedHours && point.unassignedHours > 0) {
        totalUnassignedHours += point.unassignedHours;
        
        if (!skillBreakdown[point.skillType]) {
          skillBreakdown[point.skillType] = 0;
        }
        skillBreakdown[point.skillType] += point.unassignedHours;
      }
      
      if (point.taskBreakdown) {
        const unassignedTasksInPoint = point.taskBreakdown.filter((task: any) => task.isUnassigned);
        totalUnassignedTasks += unassignedTasksInPoint.length;
      }
    });
    
    console.log('📋 [PHASE 4] Unassigned summary built:', {
      totalUnassignedTasks,
      totalUnassignedHours,
      skillsAffected: Object.keys(skillBreakdown).length
    });
    
    return {
      totalUnassignedTasks,
      totalUnassignedHours,
      skillBreakdown
    };
  }
}
