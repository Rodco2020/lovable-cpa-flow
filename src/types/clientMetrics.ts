
/**
 * Client Metrics Types - Phase 1
 * 
 * Extended types for filtered dashboard statistics
 */

export interface ClientMetricsFilters {
  staffLiaisonId?: string | null;
  status?: 'Active' | 'Inactive' | null;
  industry?: string | null;
  revenueRange?: {
    min?: number;
    max?: number;
  } | null;
  dateRange?: {
    from: Date;
    to: Date;
  } | null;
}

export interface FilteredClientStats {
  totalClients: number;
  activeClients: number;
  totalMonthlyRevenue: number;
  activeEngagements: number;
  averageRevenuePerClient: number;
  filterCriteria: ClientMetricsFilters;
}

export interface EnhancedClientDashboardStats {
  global: {
    totalClients: number;
    activeClients: number;
    totalMonthlyRevenue: number;
    activeEngagements: number;
  };
  filtered?: FilteredClientStats;
}
