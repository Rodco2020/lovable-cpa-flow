
/**
 * Reporting Data Processor
 * 
 * Handles processing and transformation of raw data into report formats
 */

import { ClientDetailReportData } from '@/types/clientReporting';
import { StaffLiaisonReportData } from '@/types/reporting';
import { ProcessedClientData, ProcessedStaffLiaisonData } from './types';

export class ReportingDataProcessor {
  /**
   * Process client report data from raw database results
   */
  processClientReportData(
    client: any,
    recurringTasks: any[],
    taskInstances: any[]
  ): ClientDetailReportData {
    const allTasks = [...recurringTasks, ...taskInstances];
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    
    return {
      client: {
        id: client.id,
        legalName: client.legal_name,
        primaryContact: client.primary_contact,
        email: client.email,
        phone: client.phone,
        industry: client.industry,
        status: client.status,
        staffLiaisonName: client.staff?.full_name
      },
      taskMetrics: this.calculateTaskMetrics(allTasks, completedTasks),
      revenueMetrics: this.calculateRevenueMetrics(client, allTasks, completedTasks),
      taskBreakdown: this.processTaskBreakdown(recurringTasks, taskInstances),
      timeline: this.generateTimeline(completedTasks)
    };
  }

  /**
   * Process staff liaison data from aggregated results
   */
  processStaffLiaisonData(data: any[]): StaffLiaisonReportData {
    return {
      summary: data.map(item => ({
        staffLiaisonId: item.staff_id,
        staffLiaisonName: item.staff_name || 'Unassigned',
        clientCount: item.client_count || 0,
        expectedMonthlyRevenue: item.total_revenue || 0,
        activeTasksCount: item.active_tasks || 0,
        completedTasksCount: item.completed_tasks || 0,
        totalTasksCount: item.total_tasks || 0,
        averageRevenuePerClient: item.avg_revenue_per_client || 0,
        taskCompletionRate: item.completion_rate || 0
      })),
      availableStaff: [],
      totalRevenue: data.reduce((sum, item) => sum + (item.total_revenue || 0), 0),
      totalClients: data.reduce((sum, item) => sum + (item.client_count || 0), 0),
      totalTasks: data.reduce((sum, item) => sum + (item.total_tasks || 0), 0)
    };
  }

  private calculateTaskMetrics(allTasks: any[], completedTasks: any[]) {
    const activeTasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Scheduled');
    const overdueTasks = allTasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'Completed'
    );

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      totalEstimatedHours: allTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
      completedHours: completedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
      remainingHours: allTasks.filter(t => t.status !== 'Completed').reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      averageTaskDuration: completedTasks.length > 0 
        ? completedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0) / completedTasks.length 
        : 0
    };
  }

  private calculateRevenueMetrics(client: any, allTasks: any[], completedTasks: any[]) {
    return {
      expectedMonthlyRevenue: client.expected_monthly_revenue || 0,
      ytdProjectedRevenue: (client.expected_monthly_revenue || 0) * 12,
      taskValueBreakdown: []
    };
  }

  private processTaskBreakdown(recurringTasks: any[], taskInstances: any[]) {
    return {
      recurring: recurringTasks.map(task => ({
        taskId: task.id,
        taskName: task.name,
        taskType: 'recurring' as const,
        category: task.category,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimated_hours,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        notes: task.notes
      })),
      adhoc: taskInstances.map(task => ({
        taskId: task.id,
        taskName: task.name,
        taskType: 'adhoc' as const,
        category: task.category,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimated_hours,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        completedDate: task.completed_at ? new Date(task.completed_at) : null,
        notes: task.notes
      }))
    };
  }

  private generateTimeline(completedTasks: any[]) {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthTasks = completedTasks.filter(t => 
        t.completed_at && 
        new Date(t.completed_at).toISOString().slice(0, 7) === monthKey
      );

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        tasksCompleted: monthTasks.length,
        revenue: monthTasks.reduce((sum, t) => sum + (t.estimated_hours * 150), 0)
      };
    }).reverse();
  }
}

