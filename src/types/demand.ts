
export interface ClientTaskDemand {
  clientTaskDemandId: string;
  taskName: string;
  clientId: string;
  clientName: string;
  monthlyHours: number;
  skillType: string;
  estimatedHours?: number;
  recurrencePattern?: string;
  recurringTaskId?: string;
  preferredStaff?: {
    staffId: string;
    full_name: string;
  } | string | null;
}

export interface DemandDataPoint {
  month: string;
  monthLabel: string;
  skillType: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
  taskBreakdown?: ClientTaskDemand[];
}

export interface SkillSummary {
  skillType: string;
  totalDemand: number;
  totalHours: number;
  taskCount: number;
  clientCount?: number;
}

export interface MonthInfo {
  key: string;
  label: string;
}

export interface DemandMatrixData {
  months: MonthInfo[];
  skills: string[];
  dataPoints: DemandDataPoint[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: SkillSummary[];
  clientTotals?: Map<string, number>;
  clientRevenue?: Map<string, number>;
  clientHourlyRates?: Map<string, number>;
  clientSuggestedRevenue?: Map<string, number>;
  clientExpectedLessSuggested?: Map<string, number>;
  revenueTotals?: {
    totalRevenue: number;
    totalSuggestedRevenue: number;
    totalExpectedLessSuggested: number;
    totalExpectedRevenue?: number;
  };
  // Add missing properties for backward compatibility
  availableClients?: Array<{ id: string; name: string }>;
  availablePreferredStaff?: Array<{ id: string; name: string }>;
}

export interface DemandMatrixFilters {
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

export interface DemandFilters {
  skillTypes?: string[];
  clientIds?: string[];
  preferredStaffIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priorities?: string[];
}

export interface ClientRevenueData {
  clientId: string;
  clientName: string;
  expectedRevenue: number;
  suggestedRevenue: number;
  actualRevenue?: number;
  variance: number;
  utilizationRate: number;
}
