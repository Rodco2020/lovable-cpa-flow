
export interface ReportFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  taskTypes: string[];
  status: string[];
  staffLiaisonIds: string[];
}

export interface StaffLiaisonSummaryData {
  staffLiaisonId: string | null;
  staffLiaisonName: string;
  clientCount: number;
  expectedMonthlyRevenue: number;
  activeTasksCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  averageRevenuePerClient: number;
  taskCompletionRate: number;
}

export interface StaffLiaisonReportData {
  summary: StaffLiaisonSummaryData[];
  availableStaff: Array<{
    id: string;
    full_name: string;
  }>;
  totalRevenue: number;
  totalClients: number;
  totalTasks: number;
}

export interface ClientTaskDetail {
  clientId: string;
  clientName: string;
  taskId: string;
  taskName: string;
  taskType: 'recurring' | 'adhoc';
  status: string;
  priority: string;
  estimatedHours: number;
  dueDate: Date | null;
  expectedRevenue: number;
}
