
import { Client } from '@/types/client';
import { ClientMetricsFilters } from '@/types/clientMetrics';
import { ClientExportData } from '@/services/export/exportService';

export const convertClientsToExportData = (clients: Client[]): ClientExportData[] => {
  return clients.map(client => ({
    id: client.id,
    legalName: client.legalName,
    primaryContact: client.primaryContact,
    email: client.email,
    phone: client.phone,
    industry: client.industry,
    status: client.status,
    expectedMonthlyRevenue: client.expectedMonthlyRevenue,
    staffLiaisonName: client.staffLiaisonName || undefined,
  }));
};

export const getAppliedFilters = (searchTerm: string, metricsFilters: ClientMetricsFilters = {}) => {
  const filters: string[] = [];
  
  // Search term filter
  if (searchTerm.trim()) {
    filters.push(`Search: "${searchTerm}"`);
  }
  
  // Metrics filters
  if (metricsFilters.staffLiaisonId) {
    filters.push(`Staff Liaison: ${metricsFilters.staffLiaisonId}`);
  }
  
  if (metricsFilters.status) {
    filters.push(`Status: ${metricsFilters.status}`);
  }
  
  if (metricsFilters.industry) {
    filters.push(`Industry: ${metricsFilters.industry}`);
  }
  
  if (metricsFilters.revenueRange) {
    const { min, max } = metricsFilters.revenueRange;
    if (min !== undefined && max !== undefined) {
      filters.push(`Revenue: $${min.toLocaleString()} - $${max.toLocaleString()}`);
    } else if (min !== undefined) {
      filters.push(`Revenue: $${min.toLocaleString()}+`);
    } else if (max !== undefined) {
      filters.push(`Revenue: Up to $${max.toLocaleString()}`);
    }
  }
  
  if (metricsFilters.dateRange) {
    const { from, to } = metricsFilters.dateRange;
    filters.push(`Created: ${from.toLocaleDateString()} - ${to.toLocaleDateString()}`);
  }
  
  return filters.length > 0 ? filters : undefined;
};
