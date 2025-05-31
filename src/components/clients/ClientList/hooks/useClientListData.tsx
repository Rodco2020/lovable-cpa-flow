
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { ClientMetricsFilters } from '@/types/clientMetrics';

export const useClientListData = (metricsFilters: ClientMetricsFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getAllClients(),
  });

  // Enhanced filtering function that combines search and metrics filters
  const filteredClients = clients?.filter(client => {
    // Search term filtering (existing functionality)
    const matchesSearch = searchTerm === '' || 
      client.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primaryContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.staffLiaisonName && client.staffLiaisonName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Metrics filters (new functionality)
    let matchesMetricsFilters = true;

    // Staff liaison filter
    if (metricsFilters.staffLiaisonId) {
      matchesMetricsFilters = matchesMetricsFilters && client.staffLiaisonId === metricsFilters.staffLiaisonId;
    }

    // Status filter
    if (metricsFilters.status) {
      matchesMetricsFilters = matchesMetricsFilters && client.status === metricsFilters.status;
    }

    // Industry filter
    if (metricsFilters.industry) {
      matchesMetricsFilters = matchesMetricsFilters && client.industry === metricsFilters.industry;
    }

    // Revenue range filter
    if (metricsFilters.revenueRange) {
      const { min, max } = metricsFilters.revenueRange;
      if (min !== undefined) {
        matchesMetricsFilters = matchesMetricsFilters && client.expectedMonthlyRevenue >= min;
      }
      if (max !== undefined) {
        matchesMetricsFilters = matchesMetricsFilters && client.expectedMonthlyRevenue <= max;
      }
    }

    // Date range filter (based on client creation date)
    if (metricsFilters.dateRange) {
      const clientDate = new Date(client.createdAt);
      const { from, to } = metricsFilters.dateRange;
      matchesMetricsFilters = matchesMetricsFilters && 
        clientDate >= from && 
        clientDate <= to;
    }

    return matchesSearch && matchesMetricsFilters;
  }) || [];

  return {
    clients,
    filteredClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm
  };
};
