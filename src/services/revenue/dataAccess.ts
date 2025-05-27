
/**
 * Revenue Data Access Layer
 * 
 * Handles all database operations for revenue calculations
 */

import { supabase } from '@/lib/supabaseClient';
import { ClientData, TaskData, SkillRateMap } from './types';

export class RevenueDataAccess {
  /**
   * Get client data by ID
   */
  async getClient(clientId: string): Promise<ClientData | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('id, legal_name, expected_monthly_revenue')
      .eq('id', clientId)
      .single();

    if (error || !data) {
      throw new Error(`Client not found: ${clientId}`);
    }

    return data;
  }

  /**
   * Get all active clients
   */
  async getActiveClients(): Promise<ClientData[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('expected_monthly_revenue, status')
      .eq('status', 'Active');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get recurring tasks for a client
   */
  async getRecurringTasks(clientId: string): Promise<TaskData[]> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get task instances for a client
   */
  async getTaskInstances(clientId: string): Promise<TaskData[]> {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get skill rates
   */
  async getSkillRates(): Promise<SkillRateMap> {
    const { data, error } = await supabase
      .from('skills')
      .select('name, cost_per_hour');

    if (error) throw error;
    
    const skillMap = new Map();
    data?.forEach(skill => {
      skillMap.set(skill.name, skill.cost_per_hour);
    });
    
    return skillMap;
  }
}
