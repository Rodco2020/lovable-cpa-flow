
import { DemandMatrixData, ClientTaskDemand, DemandDataPoint, SkillSummary, MonthInfo } from '@/types/demand';

export class DemandCalculationService {
  /**
   * Calculate demand matrix data from recurring tasks
   */
  static async calculateDemandMatrix(tasks: any[]): Promise<DemandMatrixData> {
    console.log('📊 [DEMAND CALCULATION] Starting calculation for', tasks.length, 'tasks');

    if (!tasks || tasks.length === 0) {
      return this.createEmptyDemandMatrix();
    }

    const dataPoints: DemandDataPoint[] = [];
    const skillsSet = new Set<string>();
    const clientsSet = new Set<string>();
    const monthsMap = new Map<string, string>();

    // Generate months for the next 12 months
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthsMap.set(monthKey, monthLabel);
    }

    // Process tasks to create data points
    tasks.forEach(task => {
      const skillType = task.required_skill || 'General';
      const clientId = task.client_id;
      const clientName = task.client_name || 'Unknown Client';
      
      skillsSet.add(skillType);
      clientsSet.add(clientId);

      // Calculate monthly hours based on recurrence
      const monthlyHours = this.calculateMonthlyHours(task);

      // Create data points for each month
      monthsMap.forEach((monthLabel, monthKey) => {
        const existingPoint = dataPoints.find(point => 
          point.month === monthKey && point.skillType === skillType
        );

        if (existingPoint) {
          existingPoint.demandHours += monthlyHours;
          existingPoint.taskCount += 1;
          existingPoint.taskBreakdown?.push({
            clientTaskDemandId: `${task.id}-${monthKey}`,
            taskName: task.template_name || 'Unknown Task',
            clientId,
            clientName,
            monthlyHours,
            skillType,
            estimatedHours: task.estimated_hours || 0,
            recurrencePattern: task.recurrence_pattern || '',
            recurringTaskId: task.id,
            preferredStaff: task.preferred_staff || null
          });
        } else {
          dataPoints.push({
            month: monthKey,
            monthLabel,
            skillType,
            demandHours: monthlyHours,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [{
              clientTaskDemandId: `${task.id}-${monthKey}`,
              taskName: task.template_name || 'Unknown Task',
              clientId,
              clientName,
              monthlyHours,
              skillType,
              estimatedHours: task.estimated_hours || 0,
              recurrencePattern: task.recurrence_pattern || '',
              recurringTaskId: task.id,
              preferredStaff: task.preferred_staff || null
            }]
          });
        }
      });
    });

    // Create skill summary
    const skillSummary: SkillSummary[] = Array.from(skillsSet).map(skillType => {
      const skillTasks = dataPoints.filter(point => point.skillType === skillType);
      const totalDemand = skillTasks.reduce((sum, point) => sum + point.demandHours, 0);
      const totalHours = totalDemand;
      const taskCount = skillTasks.reduce((sum, point) => sum + point.taskCount, 0);
      const clientCount = new Set(skillTasks.flatMap(point => 
        point.taskBreakdown?.map(task => task.clientId) || []
      )).size;

      return {
        skillType,
        totalDemand,
        totalHours,
        taskCount,
        clientCount
      };
    });

    const months: MonthInfo[] = Array.from(monthsMap.entries()).map(([key, label]) => ({
      key,
      label
    }));

    return {
      months,
      skills: Array.from(skillsSet),
      dataPoints,
      totalDemand: dataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      totalTasks: tasks.length,
      totalClients: clientsSet.size,
      skillSummary,
      availableClients: Array.from(clientsSet).map(id => ({ id, name: `Client ${id}` })),
      availablePreferredStaff: this.extractAvailableStaff(tasks)
    };
  }

  private static calculateMonthlyHours(task: any): number {
    const estimatedHours = task.estimated_hours || 0;
    const recurrencePattern = task.recurrence_pattern;

    if (!recurrencePattern) {
      return estimatedHours / 12; // Spread over 12 months if no pattern
    }

    // Simple calculation based on recurrence type
    if (recurrencePattern.includes('monthly')) {
      return estimatedHours;
    } else if (recurrencePattern.includes('quarterly')) {
      return estimatedHours / 3;
    } else if (recurrencePattern.includes('weekly')) {
      return estimatedHours * 4.33; // Average weeks per month
    } else if (recurrencePattern.includes('annual')) {
      return estimatedHours / 12;
    }

    return estimatedHours / 12; // Default fallback
  }

  private static extractAvailableStaff(tasks: any[]): Array<{ id: string; name: string }> {
    const staffSet = new Set<string>();
    
    tasks.forEach(task => {
      if (task.preferred_staff) {
        if (typeof task.preferred_staff === 'string') {
          staffSet.add(task.preferred_staff);
        } else if (task.preferred_staff.staffId) {
          staffSet.add(task.preferred_staff.staffId);
        }
      }
    });

    return Array.from(staffSet).map(id => ({
      id,
      name: `Staff ${id}`
    }));
  }

  private static createEmptyDemandMatrix(): DemandMatrixData {
    return {
      months: [],
      skills: [],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: [],
      availableClients: [],
      availablePreferredStaff: []
    };
  }
}
