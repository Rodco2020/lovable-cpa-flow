
export interface ClientTaskDemand {
  clientTaskDemandId: string;
  taskName: string;
  clientId: string;
  clientName: string;
  monthlyHours: number;
  skillType: string; // Add missing skillType property
  preferredStaff?: {
    staffId: string;
    full_name: string;
  } | string | null;
}

export interface DemandDataPoint {
  month: string;
  monthLabel: string; // Add missing monthLabel property
  skillType: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown?: ClientTaskDemand[];
}

export interface SkillSummary {
  skillType: string;
  totalDemand: number;
  totalHours: number; // Add missing totalHours property
  taskCount: number;
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
  // Add missing client-related properties
  clientTotals?: Map<string, number>;
  clientRevenue?: Map<string, number>;
  clientHourlyRates?: Map<string, number>;
  clientSuggestedRevenue?: Map<string, number>;
  clientExpectedLessSuggested?: Map<string, number>;
  revenueTotals?: {
    totalRevenue: number;
    totalSuggestedRevenue: number;
    totalExpectedLessSuggested: number;
  };
}

export interface DemandMatrixFilters {
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}
