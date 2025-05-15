
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { supabase, isSupabaseConnected } from '@/lib/supabaseClient';
import { useToast as useToastOriginal } from '@/hooks/use-toast';

// Local memory storage as fallback when Supabase is not connected
let clients: Client[] = [];

// Helper function to create toast without using hooks
const showToast = (title: string, description: string) => {
  // Only log to console when Supabase is not connected
  // The actual toast will be shown by the UI components
  if (!isSupabaseConnected()) {
    console.warn(`${title}: ${description}`);
  }
};

// Map Supabase data to our Client model
const mapSupabaseDataToClient = (data: any): Client => {
  if (!data) throw new Error("Invalid data from Supabase");
  
  return {
    id: data.id || "",
    legalName: data.legal_name || "",
    primaryContact: data.primary_contact || "",
    email: data.email || "",
    phone: data.phone || "",
    billingAddress: data.billing_address || "",
    industry: (data.industry || "Other") as IndustryType,
    status: (data.status || "Active") as ClientStatus,
    expectedMonthlyRevenue: data.expected_monthly_revenue || 0,
    paymentTerms: (data.payment_terms || "Net30") as PaymentTerms,
    billingFrequency: (data.billing_frequency || "Monthly") as BillingFrequency,
    defaultTaskPriority: data.default_task_priority || "Medium",
    notificationPreferences: data.notification_preferences || {
      emailReminders: true,
      taskNotifications: true,
    },
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

// Map our Client model to Supabase data
const mapClientToSupabaseData = (client: Partial<Client>) => {
  return {
    legal_name: client.legalName,
    primary_contact: client.primaryContact,
    email: client.email,
    phone: client.phone,
    billing_address: client.billingAddress,
    industry: client.industry,
    status: client.status,
    expected_monthly_revenue: client.expectedMonthlyRevenue,
    payment_terms: client.paymentTerms,
    billing_frequency: client.billingFrequency,
    default_task_priority: client.defaultTaskPriority,
    notification_preferences: client.notificationPreferences,
  };
};

// Get all clients
export const getAllClients = async (): Promise<Client[]> => {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data.map(mapSupabaseDataToClient);
    } catch (error) {
      console.error('Error fetching clients from Supabase:', error);
      showToast(
        "Database Connection Error",
        "Failed to fetch clients from Supabase. Using in-memory storage instead."
      );
      return clients;
    }
  } else {
    return clients;
  }
};

// Get a client by ID
export const getClientById = async (id: string): Promise<Client> => {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return mapSupabaseDataToClient(data);
    } catch (error) {
      console.error(`Error fetching client ${id} from Supabase:`, error);
      showToast(
        "Database Connection Error",
        "Failed to fetch client details. Using in-memory storage instead."
      );
      const client = clients.find(client => client.id === id);
      if (!client) {
        throw new Error(`Client with ID ${id} not found`);
      }
      return client;
    }
  } else {
    const client = clients.find(client => client.id === id);
    if (!client) {
      throw new Error(`Client with ID ${id} not found`);
    }
    return client;
  }
};

// Create a new client
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  // Create a new client object with ID and timestamps
  const newClient: Client = {
    ...clientData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  if (isSupabaseConnected()) {
    try {
      // Map client data to Supabase format
      const supabaseData = {
        id: newClient.id,
        ...mapClientToSupabaseData(newClient),
        created_at: newClient.createdAt.toISOString(),
        updated_at: newClient.updatedAt.toISOString(),
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert([supabaseData])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return mapSupabaseDataToClient(data);
    } catch (error) {
      console.error('Error creating client in Supabase:', error);
      showToast(
        "Database Connection Error",
        "Failed to save client to database. Saved in memory only."
      );
      // Fall back to in-memory storage
      clients.push(newClient);
      return newClient;
    }
  } else {
    // In-memory storage only
    clients.push(newClient);
    return newClient;
  }
};

// Update an existing client
export const updateClient = async (id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> => {
  const updatedData = {
    ...clientData,
    updatedAt: new Date(),
  };
  
  if (isSupabaseConnected()) {
    try {
      // Map client data to Supabase format
      const supabaseData = {
        ...mapClientToSupabaseData(updatedData),
        updated_at: updatedData.updatedAt?.toISOString(),
      };
      
      const { data, error } = await supabase
        .from('clients')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return mapSupabaseDataToClient(data);
    } catch (error) {
      console.error(`Error updating client ${id} in Supabase:`, error);
      showToast(
        "Database Connection Error",
        "Failed to update client in database. Updated in memory only."
      );
      // Fall back to in-memory storage
      const index = clients.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Client with ID ${id} not found`);
      }
      
      clients[index] = {
        ...clients[index],
        ...updatedData,
      };
      
      return clients[index];
    }
  } else {
    // In-memory storage only
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Client with ID ${id} not found`);
    }
    
    clients[index] = {
      ...clients[index],
      ...updatedData,
    };
    
    return clients[index];
  }
};

// Delete a client
export const deleteClient = async (id: string): Promise<void> => {
  if (isSupabaseConnected()) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting client ${id} from Supabase:`, error);
      showToast(
        "Database Connection Error",
        "Failed to delete client from database. Deleted from memory only."
      );
      // Fall back to in-memory storage
      clients = clients.filter(c => c.id !== id);
    }
  } else {
    // In-memory storage only
    clients = clients.filter(c => c.id !== id);
  }
};

// Get linked task IDs for a client (to be implemented when tasks module is ready)
export const getClientTaskIds = async (clientId: string): Promise<string[]> => {
  // This is a stub for now
  // In the future, it would query tasks associated with this client
  return [];
};
