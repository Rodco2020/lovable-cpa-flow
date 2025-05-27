
/**
 * Client Detail Report Service Types
 * 
 * Defines interfaces and types specific to client detail reporting
 */

export interface ClientDetailQueryParams {
  clientId: string;
  filters: any; // Will use actual filter type from imports
}

export interface ClientDetailProcessingContext {
  client: any;
  recurringTasks: any[];
  taskInstances: any[];
  staffMap: Map<string, string>;
}

export interface ClientDetailMetrics {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  totalEstimatedHours: number;
  completedHours: number;
  remainingHours: number;
  completionRate: number;
  averageTaskDuration: number;
}

export interface ClientDetailTimeline {
  month: string;
  tasksCompleted: number;
  revenue: number;
}
