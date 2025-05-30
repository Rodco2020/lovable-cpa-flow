
import { supabase } from '@/lib/supabaseClient';
import { ClientMetricsFilters, FilteredClientStats, EnhancedClientDashboardStats } from '@/types/clientMetrics';
import { ClientDashboardStats } from './clientDashboardService';

/**
 * Enhanced Client Dashboard Service - Phase 1
 * 
 * Extends existing dashboard service with filtering capabilities
 * while maintaining backward compatibility
 */

/**
 * Get filtered client statistics based on provided filters
 */
export const getFilteredClientStats = async (filters: ClientMetricsFilters): Promise<FilteredClientStats> => {
  try {
    console.log('Fetching filtered client statistics with filters:', filters);
    
    // Build the base query for clients
    let clientQuery = supabase
      .from('clients')
      .select('id, status, expected_monthly_revenue, staff_liaison_id, industry, created_at');

    // Apply filters
    if (filters.staffLiaisonId) {
      clientQuery = clientQuery.eq('staff_liaison_id', filters.staffLiaisonId);
    }

    if (filters.status) {
      clientQuery = clientQuery.eq('status', filters.status);
    }

    if (filters.industry) {
      clientQuery = clientQuery.eq('industry', filters.industry);
    }

    if (filters.revenueRange) {
      if (filters.revenueRange.min !== undefined) {
        clientQuery = clientQuery.gte('expected_monthly_revenue', filters.revenueRange.min);
      }
      if (filters.revenueRange.max !== undefined) {
        clientQuery = clientQuery.lte('expected_monthly_revenue', filters.revenueRange.max);
      }
    }

    if (filters.dateRange) {
      clientQuery = clientQuery
        .gte('created_at', filters.dateRange.from.toISOString())
        .lte('created_at', filters.dateRange.to.toISOString());
    }

    const { data: filteredClients, error: clientError } = await clientQuery;
    
    if (clientError) {
      console.error('Error fetching filtered clients:', clientError);
      throw clientError;
    }

    // Calculate metrics from filtered clients
    const totalClients = filteredClients?.length || 0;
    const activeClients = filteredClients?.filter(client => client.status === 'Active').length || 0;
    const totalMonthlyRevenue = filteredClients?.reduce(
      (sum, client) => sum + (client.expected_monthly_revenue || 0), 
      0
    ) || 0;

    // Get active engagements for filtered clients
    let engagementsQuery = supabase
      .from('recurring_tasks')
      .select('client_id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (filteredClients && filteredClients.length > 0) {
      const clientIds = filteredClients.map(client => client.id);
      engagementsQuery = engagementsQuery.in('client_id', clientIds);
    } else {
      // If no clients match the filter, there are no engagements
      const { count: activeEngagements } = await engagementsQuery.limit(0);
      return {
        totalClients: 0,
        activeClients: 0,
        totalMonthlyRevenue: 0,
        activeEngagements: 0,
        averageRevenuePerClient: 0,
        filterCriteria: filters,
      };
    }

    const { count: activeEngagements, error: engagementsError } = await engagementsQuery;
    
    if (engagementsError) {
      console.error('Error fetching filtered engagements:', engagementsError);
      throw engagementsError;
    }

    const averageRevenuePerClient = totalClients > 0 ? totalMonthlyRevenue / totalClients : 0;

    const stats = {
      totalClients,
      activeClients,
      totalMonthlyRevenue,
      activeEngagements: activeEngagements || 0,
      averageRevenuePerClient,
      filterCriteria: filters,
    };

    console.log('Filtered client stats calculated successfully:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error in getFilteredClientStats:', error);
    throw error;
  }
};

/**
 * Get enhanced dashboard stats with both global and filtered metrics
 */
export const getEnhancedClientDashboardStats = async (
  filters?: ClientMetricsFilters
): Promise<EnhancedClientDashboardStats> => {
  try {
    // Import the existing service function
    const { getClientDashboardStats } = await import('./clientDashboardService');
    
    // Get global stats using existing service
    const globalStats = await getClientDashboardStats();

    const result: EnhancedClientDashboardStats = {
      global: globalStats,
    };

    // Add filtered stats if filters are provided
    if (filters && Object.keys(filters).some(key => filters[key as keyof ClientMetricsFilters] != null)) {
      result.filtered = await getFilteredClientStats(filters);
    }

    return result;
    
  } catch (error) {
    console.error('Error in getEnhancedClientDashboardStats:', error);
    throw error;
  }
};
