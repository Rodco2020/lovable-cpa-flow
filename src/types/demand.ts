
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
  totalSuggestedRevenue?: number;
  totalExpectedLessSuggested?: number;
  averageFeeRate?: number;
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
  // Add missing properties referenced in other files
  timeHorizon?: {
    start: Date;
    end: Date;
  };
  skills?: string[];
  clients?: string[];
  preferredStaff?: {
    staffIds: string[];
    includeUnassigned: boolean;
    showOnlyPreferred: boolean;
  };
  includeInactive?: boolean;
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

// Add missing type definitions
export interface DemandForecastParameters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeSkills: string[] | 'all';
  includeClients: string[] | 'all';
}

export interface DemandForecastResult {
  data: DemandMatrixData;
  success: boolean;
  error?: string;
  metadata?: {
    generatedAt: Date;
    parameters: DemandForecastParameters;
  };
}

export interface RecurrenceCalculation {
  type: string;
  interval: number;
  frequency: number;
}

export interface PreferredStaffInfo {
  staffId: string;
  full_name: string;
}

export interface PreferredStaffMetadata {
  assignmentCount: number;
  totalHours: number;
  skills: string[];
}

export interface LegacyDemandMatrixData extends DemandMatrixData {
  legacy?: boolean;
}

export interface MatrixRevenueComparison {
  expected: number;
  suggested: number;
  variance: number;
}

// Helper function to safely extract staff ID from preferredStaff union type
export function extractStaffId(preferredStaff: string | { staffId: string; full_name: string } | null): string | null {
  if (!preferredStaff) return null;
  if (typeof preferredStaff === 'string') return preferredStaff;
  return preferredStaff.staffId || null;
}

export function hasRevenueData(data: DemandMatrixData): boolean {
  return !!(data.revenueTotals && data.revenueTotals.totalRevenue > 0);
}
