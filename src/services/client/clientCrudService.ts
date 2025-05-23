
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types/client';
import { mapClientFromDbRecord, mapClientToDbRecord } from './clientMapper';

/**
 * Client CRUD Service
 * 
 * Core functionality for client management including:
 * - Retrieving client information (by ID or all)
 * - Creating, updating, and deleting clients
 */

/**
 * Get a client by ID
 * @param clientId The UUID of the client to retrieve
 * @returns Promise resolving to Client object
 * @throws Error if client cannot be found or database error occurs
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
    
    return mapClientFromDbRecord(data);
  } catch (error) {
    console.error('Error in getClientById:', error);
    throw error;
  }
};

/**
 * Get all clients
 * @returns Promise resolving to array of Client objects
 * @throws Error if database error occurs
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
    
    return (data || []).map(mapClientFromDbRecord);
  } catch (error) {
    console.error('Error in getAllClients:', error);
    throw error;
  }
};

/**
 * Get active clients (status = 'Active')
 * @returns Promise resolving to array of active Client objects
 * @throws Error if database error occurs
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
    
    return (data || []).map(mapClientFromDbRecord);
  } catch (error) {
    console.error('Error in getActiveClients:', error);
    throw error;
  }
};

/**
 * Create a new client
 * @param client Client data to create (without id/timestamps)
 * @returns Promise resolving to the newly created Client
 * @throws Error if database insertion fails
 */
export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  try {
    const dbRecord = mapClientToDbRecord(client);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([dbRecord])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    
    return mapClientFromDbRecord(data);
  } catch (error) {
    console.error('Error in createClient:', error);
    throw error;
  }
};

/**
 * Update an existing client
 * @param clientId The UUID of the client to update
 * @param updates Partial client data to update
 * @returns Promise resolving to the updated Client
 * @throws Error if database update fails
 */
export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<Client> => {
  try {
    const dbRecord = mapClientToDbRecord(updates);
    
    const { data, error } = await supabase
      .from('clients')
      .update(dbRecord)
      .eq('id', clientId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }
    
    return mapClientFromDbRecord(data);
  } catch (error) {
    console.error('Error in updateClient:', error);
    throw error;
  }
};

/**
 * Delete a client
 * @param clientId The UUID of the client to delete
 * @returns Promise resolving to void
 * @throws Error if database deletion fails
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
