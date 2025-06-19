
/**
 * Utility functions for matrix calculations
 */
export class CalculationUtils {
  /**
   * Calculate totals from data points
   */
  static calculateTotals(dataPoints: any[]): {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
  } {
    const totalDemand = dataPoints.reduce((sum, point) => sum + (point.demandHours || 0), 0);
    const totalTasks = dataPoints.reduce((sum, point) => sum + (point.taskCount || 0), 0);
    
    const allClientIds = new Set<string>();
    dataPoints.forEach(point => {
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach((task: any) => {
          if (task.clientId) {
            allClientIds.add(task.clientId);
          }
        });
      }
    });

    return {
      totalDemand,
      totalTasks,
      totalClients: allClientIds.size
    };
  }

  /**
   * Generate skill summary from data points
   */
  static generateSkillSummary(dataPoints: any[]): Record<string, any> {
    const skillSummary: Record<string, any> = {};

    dataPoints.forEach(point => {
      const skill = point.skillType;
      if (!skillSummary[skill]) {
        skillSummary[skill] = {
          totalDemand: 0,
          totalTasks: 0,
          totalClients: new Set()
        };
      }

      skillSummary[skill].totalDemand += point.demandHours || 0;
      skillSummary[skill].totalTasks += point.taskCount || 0;
      
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach((task: any) => {
          if (task.clientId) {
            skillSummary[skill].totalClients.add(task.clientId);
          }
        });
      }
    });

    // Convert Sets to counts
    Object.keys(skillSummary).forEach(skill => {
      skillSummary[skill].totalClients = skillSummary[skill].totalClients.size;
    });

    return skillSummary;
  }
}
