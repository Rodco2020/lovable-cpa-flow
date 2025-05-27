
/**
 * Staff Liaison Report Data Processor
 * 
 * Handles all data processing and calculations for staff liaison reports
 */

import { StaffLiaisonSummaryData, ClientTaskDetail } from '@/types/reporting';
import { StaffLiaisonProcessingContext, ClientTasksByLiaisonContext } from './types';

export class StaffLiaisonDataProcessor {
  /**
   * Process staff liaison report data
   */
  processStaffLiaisonData(
    context: StaffLiaisonProcessingContext
  ) {
    const { clientsData, staffData, recurringTasks, taskInstances } = context;

    // Create staff lookup map
    const staffMap = new Map(staffData.map(staff => [staff.id, staff.full_name]));

    // Group clients by staff liaison
    const liaisonGroups = this.groupClientsByLiaison(clientsData);

    // Calculate summary data for each liaison
    const summary = this.calculateLiaisonSummaries(
      liaisonGroups,
      staffMap,
      recurringTasks,
      taskInstances
    );

    // Sort by revenue descending
    summary.sort((a, b) => b.expectedMonthlyRevenue - a.expectedMonthlyRevenue);

    // Calculate totals
    const totals = this.calculateTotals(summary);

    return {
      summary,
      availableStaff: staffData,
      ...totals
    };
  }

  /**
   * Process client tasks by liaison
   */
  processClientTasksByLiaison(
    context: ClientTasksByLiaisonContext,
    recurringTasks: any[],
    taskInstances: any[]
  ): ClientTaskDetail[] {
    const { clients, clientMap } = context;
    const details: ClientTaskDetail[] = [];

    // Process recurring tasks
    this.processRecurringTasksForDetails(recurringTasks, clientMap, details);

    // Process task instances
    this.processTaskInstancesForDetails(taskInstances, clientMap, details);

    return details;
  }

  /**
   * Group clients by staff liaison
   */
  private groupClientsByLiaison(clientsData: any[]) {
    const liaisonGroups = new Map<string, any[]>();

    clientsData.forEach(client => {
      const liaisonId = client.staff_liaison_id || 'unassigned';
      if (!liaisonGroups.has(liaisonId)) {
        liaisonGroups.set(liaisonId, []);
      }
      liaisonGroups.get(liaisonId)!.push(client);
    });

    return liaisonGroups;
  }

  /**
   * Calculate summary data for each liaison
   */
  private calculateLiaisonSummaries(
    liaisonGroups: Map<string, any[]>,
    staffMap: Map<string, string>,
    recurringTasks: any[],
    taskInstances: any[]
  ): StaffLiaisonSummaryData[] {
    const summary: StaffLiaisonSummaryData[] = [];

    for (const [liaisonId, clients] of liaisonGroups) {
      const summaryData = this.calculateSingleLiaisonSummary(
        liaisonId,
        clients,
        staffMap,
        recurringTasks,
        taskInstances
      );
      summary.push(summaryData);
    }

    return summary;
  }

  /**
   * Calculate summary for a single liaison
   */
  private calculateSingleLiaisonSummary(
    liaisonId: string,
    clients: any[],
    staffMap: Map<string, string>,
    recurringTasks: any[],
    taskInstances: any[]
  ): StaffLiaisonSummaryData {
    const liaisonName = liaisonId === 'unassigned' 
      ? 'Unassigned'
      : staffMap.get(liaisonId) || 'Unknown Staff';

    const clientIds = clients.map(c => c.id);
    
    // Calculate revenue
    const expectedMonthlyRevenue = clients.reduce(
      (sum, client) => sum + (client.expected_monthly_revenue || 0), 
      0
    );

    // Count tasks for these clients
    const taskCounts = this.calculateTaskCounts(clientIds, recurringTasks, taskInstances);

    const averageRevenuePerClient = clients.length > 0 
      ? expectedMonthlyRevenue / clients.length 
      : 0;

    const taskCompletionRate = taskCounts.totalTasksCount > 0 
      ? (taskCounts.completedTasksCount / taskCounts.totalTasksCount) * 100 
      : 0;

    return {
      staffLiaisonId: liaisonId === 'unassigned' ? null : liaisonId,
      staffLiaisonName: liaisonName,
      clientCount: clients.length,
      expectedMonthlyRevenue,
      averageRevenuePerClient,
      taskCompletionRate,
      ...taskCounts
    };
  }

  /**
   * Calculate task counts for client IDs
   */
  private calculateTaskCounts(
    clientIds: string[],
    recurringTasks: any[],
    taskInstances: any[]
  ) {
    const clientRecurringTasks = recurringTasks.filter(task => 
      clientIds.includes(task.client_id)
    );
    
    const clientTaskInstances = taskInstances.filter(task => 
      clientIds.includes(task.client_id)
    );

    const activeTasksCount = clientRecurringTasks.filter(task => 
      task.is_active && task.status !== 'Completed'
    ).length + clientTaskInstances.filter(task => 
      task.status === 'Scheduled' || task.status === 'In Progress'
    ).length;

    const completedTasksCount = clientRecurringTasks.filter(task => 
      task.status === 'Completed'
    ).length + clientTaskInstances.filter(task => 
      task.status === 'Completed'
    ).length;

    const totalTasksCount = clientRecurringTasks.length + clientTaskInstances.length;

    return {
      activeTasksCount,
      completedTasksCount,
      totalTasksCount
    };
  }

  /**
   * Calculate totals across all liaisons
   */
  private calculateTotals(summary: StaffLiaisonSummaryData[]) {
    const totalRevenue = summary.reduce((sum, item) => sum + item.expectedMonthlyRevenue, 0);
    const totalClients = summary.reduce((sum, item) => sum + item.clientCount, 0);
    const totalTasks = summary.reduce((sum, item) => sum + item.totalTasksCount, 0);

    return {
      totalRevenue,
      totalClients,
      totalTasks
    };
  }

  /**
   * Process recurring tasks for client task details
   */
  private processRecurringTasksForDetails(
    recurringTasks: any[],
    clientMap: Map<string, any>,
    details: ClientTaskDetail[]
  ) {
    recurringTasks?.forEach(task => {
      const client = clientMap.get(task.client_id);
      if (client) {
        details.push({
          clientId: task.client_id,
          clientName: client.legal_name,
          taskId: task.id,
          taskName: task.name,
          taskType: 'recurring',
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          expectedRevenue: client.expected_monthly_revenue || 0
        });
      }
    });
  }

  /**
   * Process task instances for client task details
   */
  private processTaskInstancesForDetails(
    taskInstances: any[],
    clientMap: Map<string, any>,
    details: ClientTaskDetail[]
  ) {
    taskInstances?.forEach(task => {
      const client = clientMap.get(task.client_id);
      if (client) {
        details.push({
          clientId: task.client_id,
          clientName: client.legal_name,
          taskId: task.id,
          taskName: task.name,
          taskType: 'adhoc',
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          expectedRevenue: client.expected_monthly_revenue || 0
        });
      }
    });
  }
}
