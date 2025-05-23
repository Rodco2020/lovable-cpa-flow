
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types/client';
import { StaffMember } from '@/types/staff';
import { getClientAdHocTasks, getClientRecurringTasks } from './clientTaskService';
import { copyRecurringTask, copyAdHocTask, copyClientTasks } from './taskCopyService';

/**
 * Client Service
 * 
 * Core functionality for client management including:
 * - Retrieving client information (by ID or all)
 * - Creating, updating, and deleting clients
 * - Getting staff members for liaison dropdown
 */

/**
 * Get a client by ID
 */
export const getClientById = async (clientId: string): Promise<Client> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
      
    if (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getClientById:', error);
    throw error;
  }
};

/**
 * Get all clients
 */
export const getAllClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('legal_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching all clients:', error);
      throw error;
    }
    
    // Map from snake_case to camelCase
    return data?.map(client => ({
      id: client.id,
      legalName: client.legal_name,
      primaryContact: client.primary_contact,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billing_address,
      industry: client.industry,
      status: client.status,
      expectedMonthlyRevenue: client.expected_monthly_revenue,
      paymentTerms: client.payment_terms,
      billingFrequency: client.billing_frequency,
      defaultTaskPriority: client.default_task_priority,
      staffLiaisonId: client.staff_liaison_id,
      notificationPreferences: client.notification_preferences || {
        emailReminders: true,
        taskNotifications: true
      },
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    })) || [];
  } catch (error) {
    console.error('Error in getAllClients:', error);
    throw error;
  }
};

/**
 * Get active clients
 */
export const getActiveClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('status', 'Active')
      .order('legal_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching active clients:', error);
      throw error;
    }
    
    // Map from snake_case to camelCase (reusing code from getAllClients)
    return data?.map(client => ({
      id: client.id,
      legalName: client.legal_name,
      primaryContact: client.primary_contact,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billing_address,
      industry: client.industry,
      status: client.status,
      expectedMonthlyRevenue: client.expected_monthly_revenue,
      paymentTerms: client.payment_terms,
      billingFrequency: client.billing_frequency,
      defaultTaskPriority: client.default_task_priority,
      staffLiaisonId: client.staff_liaison_id,
      notificationPreferences: client.notification_preferences || {
        emailReminders: true,
        taskNotifications: true
      },
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    })) || [];
  } catch (error) {
    console.error('Error in getActiveClients:', error);
    throw error;
  }
};

/**
 * Create a new client
 */
export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createClient:', error);
    throw error;
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<Client> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateClient:', error);
    throw error;
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
      
    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteClient:', error);
    throw error;
  }
};

/**
 * Get staff members for liaison dropdown
 */
export const getStaffForLiaisonDropdown = async (): Promise<StaffMember[]> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('status', 'Active')
      .order('lastName', { ascending: true });
      
    if (error) {
      console.error('Error fetching staff for dropdown:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getStaffForLiaisonDropdown:', error);
    throw error;
  }
};

// Re-export task functions for backward compatibility and to maintain the API
export { 
  getClientAdHocTasks, 
  getClientRecurringTasks,
  copyRecurringTask,
  copyAdHocTask,
  copyClientTasks
};
