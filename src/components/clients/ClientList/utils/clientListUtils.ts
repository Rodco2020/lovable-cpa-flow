
import { Client } from '@/types/client';
import { ClientExportData } from '@/services/export/exportService';

/**
 * Converts clients to export format
 */
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
    staffLiaisonName: client.staffLiaisonName
  }));
};

/**
 * Gets applied filters for export
 */
export const getAppliedFilters = (searchTerm: string): Record<string, any> => {
  const filters: Record<string, any> = {};
  if (searchTerm) {
    filters['Search Term'] = searchTerm;
  }
  return filters;
};
