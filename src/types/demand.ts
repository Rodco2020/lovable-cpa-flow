
export interface ClientTaskDemand {
  clientTaskDemandId: string;
  taskName: string;
  clientId: string;
  clientName: string;
  monthlyHours: number;
  preferredStaff?: {
    staffId: string;
    full_name: string;
  } | string | null;
}

export interface DemandDataPoint {
  month: string;
  skillType: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown?: ClientTaskDemand[];
}

export interface SkillSummary {
  skillType: string;
  totalDemand: number;
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
}

export interface DemandMatrixFilters {
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}
