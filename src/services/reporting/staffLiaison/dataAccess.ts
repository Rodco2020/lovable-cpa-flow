
/**
 * Staff Liaison Report Data Access Layer
 * 
 * Handles all database operations for staff liaison reports
 */

import { supabase } from '@/lib/supabaseClient';
import { ReportFilters } from '@/types/reporting';

export class StaffLiaisonDataAccess {
  /**
   * Get all active clients with liaison assignments and expected revenue
   */
  async getClientsData() {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        legal_name,
        staff_liaison_id,
        expected_monthly_revenue,
        status
      `)
      .eq('status', 'Active');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }

    return clientsData || [];
  }

  /**
   * Get all active staff members
   */
  async getStaffData() {
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active');

    if (staffError) {
      console.error('Error fetching staff:', staffError);
      throw staffError;
    }

    return staffData || [];
  }

  /**
   * Get all recurring tasks
   */
  async getRecurringTasks() {
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('client_id, status, is_active');

    if (recurringError) {
      console.error('Error fetching recurring tasks:', recurringError);
      throw recurringError;
    }

    return recurringTasks || [];
  }

  /**
   * Get all task instances
   */
  async getTaskInstances() {
    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select('client_id, status');

    if (instancesError) {
      console.error('Error fetching task instances:', instancesError);
      throw instancesError;
    }

    return taskInstances || [];
  }

  /**
   * Get clients for specific liaison
   */
  async getClientsForLiaison(liaisonId: string | null) {
    let clientsQuery = supabase
      .from('clients')
      .select('id, legal_name, expected_monthly_revenue');

    if (liaisonId) {
      clientsQuery = clientsQuery.eq('staff_liaison_id', liaisonId);
    } else {
      clientsQuery = clientsQuery.is('staff_liaison_id', null);
    }

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) {
      console.error('Error fetching clients for liaison:', clientsError);
      throw clientsError;
    }

    return clients || [];
  }

  /**
   * Get recurring tasks for specific clients
   */
  async getRecurringTasksForClients(clientIds: string[]) {
    if (clientIds.length === 0) return [];

    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .in('client_id', clientIds);

    if (recurringError) {
      console.error('Error fetching recurring tasks:', recurringError);
      throw recurringError;
    }

    return recurringTasks || [];
  }

  /**
   * Get task instances for specific clients
   */
  async getTaskInstancesForClients(clientIds: string[]) {
    if (clientIds.length === 0) return [];

    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select('*')
      .in('client_id', clientIds);

    if (instancesError) {
      console.error('Error fetching task instances:', instancesError);
      throw instancesError;
    }

    return taskInstances || [];
  }
}
