
/**
 * Client Detail Report Data Processor
 * 
 * Handles processing and transformation of raw data into report format
 */

import { 
  ClientDetailReportData, 
  ClientTaskDetail, 
  ClientTaskMetrics, 
  ClientRevenueMetrics 
} from '@/types/clientReporting';
import { ClientDetailProcessingContext, ClientDetailMetrics, ClientDetailTimeline } from './types';

export class ClientDetailDataProcessor {
  private static readonly HOURLY_RATE = 150; // Assume $150/hour

  /**
   * Process complete client report data
   */
  processClientReportData(
    context: ClientDetailProcessingContext,
    staffLiaisonName?: string
  ): ClientDetailReportData {
    const { client, recurringTasks, taskInstances, staffMap } = context;

    // Process task details
    const recurringTaskDetails = this.processRecurringTasks(recurringTasks);
    const adhocTaskDetails = this.processTaskInstances(taskInstances, staffMap);

    // Calculate metrics
    const allTasks = [...recurringTaskDetails, ...adhocTaskDetails];
    const taskMetrics = this.calculateTaskMetrics(allTasks);
    const revenueMetrics = this.calculateRevenueMetrics(client, allTasks);
    const timeline = this.generateTimeline(adhocTaskDetails);

    return {
      client: {
        id: client.id,
        legalName: client.legal_name,
        primaryContact: client.primary_contact,
        email: client.email,
        phone: client.phone,
        industry: client.industry,
        status: client.status,
        staffLiaisonName
      },
      taskMetrics,
      revenueMetrics,
      taskBreakdown: {
        recurring: recurringTaskDetails,
        adhoc: adhocTaskDetails
      },
      timeline
    };
  }

  /**
   * Process recurring tasks into ClientTaskDetail format
   */
  private processRecurringTasks(recurringTasks: any[]): ClientTaskDetail[] {
    return recurringTasks.map(task => ({
      taskId: task.id,
      taskName: task.name,
      taskType: 'recurring' as const,
      category: task.category,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimated_hours,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      notes: task.notes
    }));
  }

  /**
   * Process task instances into ClientTaskDetail format
   */
  private processTaskInstances(taskInstances: any[], staffMap: Map<string, string>): ClientTaskDetail[] {
    return taskInstances.map(task => ({
      taskId: task.id,
      taskName: task.name,
      taskType: 'adhoc' as const,
      category: task.category,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimated_hours,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      completedDate: task.completed_at ? new Date(task.completed_at) : null,
      assignedStaffName: task.assigned_staff_id ? staffMap.get(task.assigned_staff_id) : undefined,
      notes: task.notes
    }));
  }

  /**
   * Calculate task metrics from processed tasks
   */
  private calculateTaskMetrics(allTasks: ClientTaskDetail[]): ClientTaskMetrics {
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const activeTasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Scheduled');
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && 
      t.dueDate < new Date() && 
      t.status !== 'Completed'
    );

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      totalEstimatedHours: allTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      completedHours: completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      remainingHours: activeTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      averageTaskDuration: completedTasks.length > 0 
        ? completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0) / completedTasks.length 
        : 0
    };
  }

  /**
   * Calculate revenue metrics from client and tasks
   */
  private calculateRevenueMetrics(client: any, allTasks: ClientTaskDetail[]): ClientRevenueMetrics {
    // Calculate category breakdown
    const categoryBreakdown = allTasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { estimated: 0, completed: 0 };
      }
      const taskValue = task.estimatedHours * ClientDetailDataProcessor.HOURLY_RATE;
      acc[task.category].estimated += taskValue;
      if (task.status === 'Completed') {
        acc[task.category].completed += taskValue;
      }
      return acc;
    }, {} as Record<string, { estimated: number; completed: number }>);

    return {
      expectedMonthlyRevenue: client.expected_monthly_revenue || 0,
      ytdProjectedRevenue: (client.expected_monthly_revenue || 0) * 12,
      taskValueBreakdown: Object.entries(categoryBreakdown).map(([category, values]) => ({
        category,
        estimatedValue: values.estimated,
        completedValue: values.completed
      }))
    };
  }

  /**
   * Generate timeline data for the last 12 months
   */
  private generateTimeline(adhocTasks: ClientTaskDetail[]): ClientDetailTimeline[] {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthTasks = adhocTasks.filter(t => 
        t.completedDate && 
        t.completedDate.toISOString().slice(0, 7) === monthKey
      );

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        tasksCompleted: monthTasks.length,
        revenue: monthTasks.reduce((sum, t) => sum + (t.estimatedHours * ClientDetailDataProcessor.HOURLY_RATE), 0)
      };
    }).reverse();
  }
}
