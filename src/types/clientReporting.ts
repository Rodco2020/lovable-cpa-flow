
export interface ClientReportFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  taskTypes: string[];
  status: string[];
  categories: string[];
  includeCompleted: boolean;
}

export interface ClientTaskMetrics {
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

export interface ClientRevenueMetrics {
  expectedMonthlyRevenue: number;
  ytdProjectedRevenue: number;
  taskValueBreakdown: {
    category: string;
    estimatedValue: number;
    completedValue: number;
  }[];
}

export interface ClientDetailReportData {
  client: {
    id: string;
    legalName: string;
    primaryContact: string;
    email: string;
    phone: string;
    industry: string;
    status: string;
    staffLiaisonName?: string;
  };
  taskMetrics: ClientTaskMetrics;
  revenueMetrics: ClientRevenueMetrics;
  taskBreakdown: {
    recurring: ClientTaskDetail[];
    adhoc: ClientTaskDetail[];
  };
  timeline: {
    month: string;
    tasksCompleted: number;
    revenue: number;
  }[];
}

export interface ClientTaskDetail {
  taskId: string;
  taskName: string;
  taskType: 'recurring' | 'adhoc';
  category: string;
  status: string;
  priority: string;
  estimatedHours: number;
  completedHours?: number;
  dueDate: Date | null;
  completedDate?: Date | null;
  assignedStaffName?: string;
  notes?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeTaskDetails: boolean;
  includeTimeline: boolean;
  customFields: string[];
}

export interface ReportCustomization {
  title: string;
  includeLogo: boolean;
  includeFooter: boolean;
  customFooterText: string;
  colorScheme: 'default' | 'blue' | 'green' | 'purple';
  showMetrics: boolean;
  showCharts: boolean;
  groupTasksBy: 'category' | 'status' | 'priority' | 'none';
}
