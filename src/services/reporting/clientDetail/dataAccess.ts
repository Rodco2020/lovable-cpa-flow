
/**
 * Client Detail Report Data Access Layer
 * 
 * Handles all database operations for client detail reports
 */

import { supabase } from '@/lib/supabaseClient';
import { ClientReportFilters } from '@/types/clientReporting';

export class ClientDetailDataAccess {
  /**
   * Get client information with staff liaison
   */
  async getClientWithLiaison(clientId: string) {
    const { data: client, error: clientError } = await supabase
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
        staff_liaison_id
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    return client;
  }

  /**
   * Get staff liaison name if exists
   */
  async getStaffLiaisonName(staffLiaisonId: string | null): Promise<string | undefined> {
    if (!staffLiaisonId) return undefined;

    const { data: staff } = await supabase
      .from('staff')
      .select('full_name')
      .eq('id', staffLiaisonId)
      .single();
    
    return staff?.full_name;
  }

  /**
   * Get recurring tasks for client
   */
  async getRecurringTasks(clientId: string) {
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId);

    if (recurringError) {
      console.error('Error fetching recurring tasks:', recurringError);
      throw recurringError;
    }

    return recurringTasks || [];
  }

  /**
   * Get task instances for client
   */
  async getTaskInstances(clientId: string) {
    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId);

    if (instancesError) {
      console.error('Error fetching task instances:', instancesError);
      throw instancesError;
    }

    return taskInstances || [];
  }

  /**
   * Get staff names for task assignments
   */
  async getStaffMap(taskInstances: any[]): Promise<Map<string, string>> {
    const staffIds = [
      ...new Set(taskInstances
        .map(t => t.assigned_staff_id)
        .filter(Boolean))
    ];

    if (staffIds.length === 0) {
      return new Map();
    }

    const { data: staffData } = await supabase
      .from('staff')
      .select('id, full_name')
      .in('id', staffIds);

    return new Map(staffData?.map(s => [s.id, s.full_name]) || []);
  }

  /**
   * Get active clients list
   */
  async getActiveClientsList(): Promise<Array<{ id: string; legalName: string }>> {
    const { data, error } = await supabase
      .from('clients')
      .select('id, legal_name')
      .eq('status', 'Active')
      .order('legal_name');

    if (error) {
      throw error;
    }

    return data.map(client => ({
      id: client.id,
      legalName: client.legal_name
    }));
  }
}
