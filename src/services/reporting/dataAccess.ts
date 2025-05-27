
/**
 * Reporting Data Access Layer
 * 
 * Handles all database operations for reporting with optimized queries
 */

import { supabase } from '@/lib/supabaseClient';
import { ReportFilters } from '@/types/reporting';

export class ReportingDataAccess {
  /**
   * Get client data with liaison information using optimized query
   */
  async getClientWithLiaison(clientId: string) {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        legal_name,
        primary_contact,
        email,
        phone,
        industry,
        status,
        expected_monthly_revenue,
        staff_liaison_id,
        staff:staff!clients_staff_liaison_id_fkey(full_name)
      `)
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;
    return clientData;
  }

  /**
   * Get recurring tasks for a client
   */
  async getRecurringTasks(clientId: string) {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get task instances for a client
   */
  async getTaskInstances(clientId: string) {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get staff liaison summary with aggregated data
   */
  async getStaffLiaisonSummary(filters: ReportFilters) {
    const { data: aggregatedData, error } = await supabase
      .rpc('get_staff_liaison_summary', {
        filter_date_from: filters.dateRange.from.toISOString(),
        filter_date_to: filters.dateRange.to.toISOString()
      });

    if (error) throw error;
    return aggregatedData;
  }
}

