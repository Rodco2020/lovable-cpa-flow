
/**
 * Staff Liaison Report Service Types
 * 
 * Defines interfaces and types specific to staff liaison reporting
 */

export interface StaffLiaisonQueryParams {
  filters: any; // Will use actual filter type from imports
}

export interface StaffLiaisonProcessingContext {
  clientsData: any[];
  staffData: any[];
  recurringTasks: any[];
  taskInstances: any[];
}

export interface StaffLiaisonMetrics {
  totalRevenue: number;
  totalClients: number;
  totalTasks: number;
  staffCount: number;
  averageRevenuePerStaff: number;
  averageClientsPerStaff: number;
}

export interface ClientTasksByLiaisonContext {
  liaisonId: string | null;
  filters: any;
  clients: any[];
  clientMap: Map<string, any>;
}
