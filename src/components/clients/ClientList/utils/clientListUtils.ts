
import { Client } from '@/types/client';
import { ClientMetricsFilters } from '@/types/clientMetrics';

export interface ExportableClientData {
  legalName: string;
  primaryContact: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  expectedMonthlyRevenue: string;
  staffLiaisonName?: string;
  createdAt: string;
}

export const convertClientsToExportData = (clients: Client[]): ExportableClientData[] => {
  return clients.map(client => ({
    legalName: client.legalName,
    primaryContact: client.primaryContact,
    email: client.email,
    phone: client.phone,
    industry: client.industry,
    status: client.status,
    expectedMonthlyRevenue: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(client.expectedMonthlyRevenue),
    staffLiaisonName: client.staffLiaisonName || 'Unassigned',
    createdAt: new Date(client.createdAt).toLocaleDateString(),
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
