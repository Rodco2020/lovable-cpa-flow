
import { supabase } from '@/lib/supabaseClient';

/**
 * Client Dashboard Service
 * 
 * Provides statistical data for the client dashboard including counts,
 * revenue calculations, and engagement metrics.
 */

export interface ClientDashboardStats {
  totalClients: number;
  activeClients: number;
  totalMonthlyRevenue: number;
  activeEngagements: number;
}

/**
 * Fetch comprehensive dashboard statistics for clients
 * @returns Promise resolving to ClientDashboardStats
 * @throws Error if database queries fail
 */
export const getClientDashboardStats = async (): Promise<ClientDashboardStats> => {
  try {
    console.log('Fetching client dashboard statistics...');
    
    // Get total client count
    const { count: totalClients, error: totalError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
      
    if (totalError) {
      console.error('Error fetching total clients:', totalError);
      throw totalError;
    }

    // Get active client count
    const { count: activeClients, error: activeError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');
      
    if (activeError) {
      console.error('Error fetching active clients:', activeError);
      throw activeError;
    }

    // Get total monthly revenue from active clients
    const { data: revenueData, error: revenueError } = await supabase
      .from('clients')
      .select('expected_monthly_revenue')
      .eq('status', 'Active');
      
    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError);
      throw revenueError;
    }

    const totalMonthlyRevenue = revenueData?.reduce(
      (sum, client) => sum + (client.expected_monthly_revenue || 0), 
      0
    ) || 0;

    // Get active engagements count (recurring tasks that are active)
    const { count: activeEngagements, error: engagementsError } = await supabase
      .from('recurring_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
      
    if (engagementsError) {
      console.error('Error fetching active engagements:', engagementsError);
      throw engagementsError;
    }

    const stats = {
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      totalMonthlyRevenue,
      activeEngagements: activeEngagements || 0,
    };

    console.log('Client dashboard stats fetched successfully:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error in getClientDashboardStats:', error);
    throw error;
  }
};
