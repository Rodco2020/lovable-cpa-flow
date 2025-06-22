/**
 * Demand Drill Down Service
 * Provides detailed breakdown of demand data for analysis
 */

import { DemandMatrixData, ClientTaskDemand } from '@/types/demand';
import { extractStaffId } from './utils/staffExtractionUtils';

export class DemandDrillDownService {
  /**
   * Get detailed breakdown for a specific skill and month
   */
  static getDrillDownData(
    demandData: DemandMatrixData,
    skillType: string,
    month: string
  ): ClientTaskDemand[] {
    console.log(`🔍 [DRILL DOWN] Getting drill down for skill: ${skillType}, month: ${month}`);

    const relevantDataPoints = demandData.dataPoints.filter(
      point => point.skillType === skillType && point.month === month
    );

    const allTasks: ClientTaskDemand[] = [];

    relevantDataPoints.forEach(point => {
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach((task: any) => {
          allTasks.push({
            clientTaskDemandId: task.clientTaskDemandId || `${task.clientId}-${task.taskName}`,
            taskName: task.taskName || 'Unknown Task',
            clientId: task.clientId || '',
            clientName: task.clientName || 'Unknown Client',
            monthlyHours: task.monthlyHours || 0,
            skillType: skillType,
            estimatedHours: task.estimatedHours || task.monthlyHours || 0,
            recurrencePattern: task.recurrencePattern || '',
            recurringTaskId: task.recurringTaskId || '',
            // FIXED: Use extractStaffId utility for safe staff ID extraction
            preferredStaff: extractStaffId(task.preferredStaff)
          });
        });
      }
    });

    console.log(`✅ [DRILL DOWN] Found ${allTasks.length} tasks for drill down`);
    return allTasks;
  }

  /**
   * Aggregate demand by client
   */
  static aggregateDemandByClient(demandData: DemandMatrixData): {
    [clientId: string]: {
      clientName: string;
      totalDemand: number;
      tasks: ClientTaskDemand[];
    };
  } {
    const clientDemand: {
      [clientId: string]: {
        clientName: string;
        totalDemand: number;
        tasks: ClientTaskDemand[];
      };
    } = {};

    demandData.dataPoints.forEach(point => {
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach(task => {
          if (!clientDemand[task.clientId]) {
            clientDemand[task.clientId] = {
              clientName: task.clientName,
              totalDemand: 0,
              tasks: []
            };
          }
          clientDemand[task.clientId].totalDemand += task.monthlyHours;
          clientDemand[task.clientId].tasks.push(task);
        });
      }
    });

    return clientDemand;
  }

  /**
   * Get top clients by demand
   */
  static getTopClientsByDemand(
    demandData: DemandMatrixData,
    limit: number
  ): {
    clientId: string;
    clientName: string;
    totalDemand: number;
  }[] {
    const clientDemand = this.aggregateDemandByClient(demandData);

    const sortedClients = Object.entries(clientDemand)
      .sort(([, a], [, b]) => b.totalDemand - a.totalDemand)
      .slice(0, limit)
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.clientName,
        totalDemand: data.totalDemand
      }));

    return sortedClients;
  }

  /**
   * Get skills required for a specific client
   */
  static getSkillsForClient(
    demandData: DemandMatrixData,
    clientId: string
  ): string[] {
    const skills = new Set<string>();

    demandData.dataPoints.forEach(point => {
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach(task => {
          if (task.clientId === clientId) {
            skills.add(point.skillType);
          }
        });
      }
    });

    return Array.from(skills);
  }
}
