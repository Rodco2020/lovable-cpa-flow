
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { getRecurringTasks, getTaskInstances } from '@/services/taskService';
import { RecurringTask, TaskInstance } from '@/types/task';

// Local memory storage as fallback when Supabase is not connected
let clients: Client[] = [];

// Map Supabase data to our Client model
const mapSupabaseDataToClient = (data: any): Client => {
  if (!data) throw new Error("Invalid data from Supabase");
  
  console.log("Raw client data from Supabase:", data);
  
  const mappedClient = {
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
  
  console.log("Mapped client:", mappedClient);
  return mappedClient;
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

// Get all clients (renamed to match the usage in ClientList.tsx)
export const getClients = async (filters?: { status?: ClientStatus[]; industry?: IndustryType[] }): Promise<Client[]> => {
  return getAllClients(filters);
};

// Get all clients
export const getAllClients = async (filters?: { status?: ClientStatus[]; industry?: IndustryType[] }): Promise<Client[]> => {
  try {
    console.log("Fetching clients from Supabase with filters:", JSON.stringify(filters, null, 2));
    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status && filters.status.length > 0) {
      console.log("Applying status filter:", filters.status);
      query = query.in('status', filters.status);
    }
    
    if (filters?.industry && filters.industry.length > 0) {
      console.log("Applying industry filter:", filters.industry);
      query = query.in('industry', filters.industry);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching clients from Supabase:', error);
      return clients; // Fallback to in-memory
    }

    console.log("Raw data from Supabase query:", data);
    
    if (!data || data.length === 0) {
      console.log("No clients found in Supabase, returning empty array");
      return [];
    }
    
    // Log each client data to check values
    data.forEach(client => {
      console.log("Client from Supabase:", {
        id: client.id,
        legal_name: client.legal_name,
        status: client.status, 
        industry: client.industry
      });
    });
    
    const mappedClients = data.map(mapSupabaseDataToClient);
    console.log("All mapped clients:", mappedClients);
    return mappedClients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    
    // Apply filters to in-memory clients if needed
    let filteredClients = clients;
    
    if (filters?.status && filters.status.length > 0) {
      filteredClients = filteredClients.filter(c => filters.status?.includes(c.status));
    }
    
    if (filters?.industry && filters.industry.length > 0) {
      filteredClients = filteredClients.filter(c => filters.industry?.includes(c.industry));
    }
    
    return filteredClients;
  }
};

// Get a client by ID
export const getClientById = async (id: string): Promise<Client> => {
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
    // Fall back to in-memory storage
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
};

// Delete a client
export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    // Also remove from local array to keep in sync
    clients = clients.filter(c => c.id !== id);
    return true;
  } catch (error) {
    console.error(`Error deleting client ${id} from Supabase:`, error);
    // Fall back to in-memory storage
    clients = clients.filter(c => c.id !== id);
    return true;
  }
};

// Get linked task IDs for a client
export const getClientTaskIds = async (clientId: string): Promise<string[]> => {
  // This is a stub - in the future, it would query tasks associated with this client
  return [];
};

// Get recurring tasks for a client
export const getClientRecurringTasks = async (clientId: string): Promise<RecurringTask[]> => {
  try {
    // Use the task service to get all recurring tasks and filter by client ID
    const allRecurringTasks = await getRecurringTasks(false); // Include both active and inactive tasks
    return allRecurringTasks.filter(task => task.clientId === clientId);
  } catch (error) {
    console.error(`Error fetching recurring tasks for client ${clientId}:`, error);
    return []; // Return empty array on error
  }
};

// Get ad-hoc tasks for a client
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstance[]> => {
  try {
    // Use the task service to get task instances that aren't generated from recurring tasks
    // and filter by client ID
    const allTaskInstances = await getTaskInstances({
      clientId: clientId
    });
    
    // Filter out tasks that were generated from recurring tasks
    return allTaskInstances.filter(task => !task.recurringTaskId);
  } catch (error) {
    console.error(`Error fetching ad-hoc tasks for client ${clientId}:`, error);
    return []; // Return empty array on error
  }
};
