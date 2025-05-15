
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientStatus, IndustryType } from '@/types/client';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

// Client CRUD operations
export const getClients = async (filters?: {
  status?: ClientStatus[];
  industry?: IndustryType[];
}): Promise<Client[]> => {
  try {
    let query = supabase.from('clients').select('*');
    
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.industry && filters.industry.length > 0) {
        query = query.in('industry', filters.industry);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error fetching clients",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
    
    // Map Supabase data format to our Client type
    return data.map(item => ({
      id: item.id,
      legalName: item.legal_name,
      primaryContact: item.primary_contact,
      email: item.email,
      phone: item.phone,
      billingAddress: item.billing_address,
      industry: item.industry as IndustryType,
      status: item.status as ClientStatus,
      expectedMonthlyRevenue: item.expected_monthly_revenue,
      paymentTerms: item.payment_terms,
      billingFrequency: item.billing_frequency,
      defaultTaskPriority: item.default_task_priority,
      notificationPreferences: item.notification_preferences as Client['notificationPreferences'],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Map Supabase data to Client type
    return {
      id: data.id,
      legalName: data.legal_name,
      primaryContact: data.primary_contact,
      email: data.email,
      phone: data.phone,
      billingAddress: data.billing_address,
      industry: data.industry as IndustryType,
      status: data.status as ClientStatus,
      expectedMonthlyRevenue: data.expected_monthly_revenue,
      paymentTerms: data.payment_terms,
      billingFrequency: data.billing_frequency,
      defaultTaskPriority: data.default_task_priority,
      notificationPreferences: data.notification_preferences as Client['notificationPreferences'],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return undefined;
  }
};

export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
  try {
    const newId = uuidv4();
    const now = new Date().toISOString();
    
    // Map our Client type to Supabase format
    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: newId,
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
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error creating client",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    return {
      id: data.id,
      legalName: data.legal_name,
      primaryContact: data.primary_contact,
      email: data.email,
      phone: data.phone,
      billingAddress: data.billing_address,
      industry: data.industry as IndustryType,
      status: data.status as ClientStatus,
      expectedMonthlyRevenue: data.expected_monthly_revenue,
      paymentTerms: data.payment_terms,
      billingFrequency: data.billing_frequency,
      defaultTaskPriority: data.default_task_priority,
      notificationPreferences: data.notification_preferences as Client['notificationPreferences'],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client | null> => {
  try {
    // Map our Client type to Supabase format
    const supabaseUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.legalName !== undefined) supabaseUpdates.legal_name = updates.legalName;
    if (updates.primaryContact !== undefined) supabaseUpdates.primary_contact = updates.primaryContact;
    if (updates.email !== undefined) supabaseUpdates.email = updates.email;
    if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
    if (updates.billingAddress !== undefined) supabaseUpdates.billing_address = updates.billingAddress;
    if (updates.industry !== undefined) supabaseUpdates.industry = updates.industry;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.expectedMonthlyRevenue !== undefined) supabaseUpdates.expected_monthly_revenue = updates.expectedMonthlyRevenue;
    if (updates.paymentTerms !== undefined) supabaseUpdates.payment_terms = updates.paymentTerms;
    if (updates.billingFrequency !== undefined) supabaseUpdates.billing_frequency = updates.billingFrequency;
    if (updates.defaultTaskPriority !== undefined) supabaseUpdates.default_task_priority = updates.defaultTaskPriority;
    if (updates.notificationPreferences !== undefined) supabaseUpdates.notification_preferences = updates.notificationPreferences;
    
    const { data, error } = await supabase
      .from('clients')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error updating client",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      legalName: data.legal_name,
      primaryContact: data.primary_contact,
      email: data.email,
      phone: data.phone,
      billingAddress: data.billing_address,
      industry: data.industry as IndustryType,
      status: data.status as ClientStatus,
      expectedMonthlyRevenue: data.expected_monthly_revenue,
      paymentTerms: data.payment_terms,
      billingFrequency: data.billing_frequency,
      defaultTaskPriority: data.default_task_priority,
      notificationPreferences: data.notification_preferences as Client['notificationPreferences'],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
};

// Client engagement tracking
export const getClientRecurringTasks = async (clientId: string): Promise<string[]> => {
  // In a real implementation, this would query the task service
  // For now, returning a placeholder
  return ["task-id-1", "task-id-2"];
};

export const getClientAdHocTasks = async (clientId: string): Promise<string[]> => {
  // In a real implementation, this would query the task service
  // For now, returning a placeholder
  return ["task-id-3", "task-id-4"];
};

// Initialize with sample data - will be removed in production
export const initializeClientData = async () => {
  try {
    // Check if we have clients already
    const { data: existingClients, error: countError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (countError) {
      console.error('Error checking for existing clients:', countError);
      return;
    }
    
    // If we have clients, don't initialize
    if (existingClients && existingClients.length > 0) {
      console.log('Clients already exist, skipping initialization');
      return;
    }
    
    // Sample clients to create
    const sampleClients = [
      {
        legalName: "ABC Corporation",
        primaryContact: "John Smith",
        email: "john@abccorp.com",
        phone: "(555) 123-4567",
        billingAddress: "123 Business Ave, Suite 100, New York, NY 10001",
        industry: "Technology" as IndustryType,
        status: "Active" as ClientStatus,
        expectedMonthlyRevenue: 5000,
        paymentTerms: "Net30",
        billingFrequency: "Monthly",
        defaultTaskPriority: "Medium",
        notificationPreferences: {
          emailReminders: true,
          taskNotifications: true
        }
      },
      {
        legalName: "XYZ Enterprises",
        primaryContact: "Sarah Johnson",
        email: "sarah@xyzent.com",
        phone: "(555) 987-6543",
        billingAddress: "456 Commerce St, Chicago, IL 60601",
        industry: "Manufacturing" as IndustryType,
        status: "Active" as ClientStatus,
        expectedMonthlyRevenue: 8500,
        paymentTerms: "Net45",
        billingFrequency: "Quarterly",
        defaultTaskPriority: "High",
        notificationPreferences: {
          emailReminders: true,
          taskNotifications: false
        }
      },
      {
        legalName: "Acme Consulting",
        primaryContact: "Michael Brown",
        email: "michael@acmeconsulting.com",
        phone: "(555) 456-7890",
        billingAddress: "789 Professional Dr, Austin, TX 78701",
        industry: "Professional Services" as IndustryType,
        status: "Inactive" as ClientStatus,
        expectedMonthlyRevenue: 3200,
        paymentTerms: "Net30",
        billingFrequency: "Monthly",
        defaultTaskPriority: "Medium",
        notificationPreferences: {
          emailReminders: false,
          taskNotifications: true
        }
      }
    ];
    
    // Create each sample client
    for (const client of sampleClients) {
      await createClient(client);
    }
    
    console.log('Sample clients created successfully');
  } catch (error) {
    console.error('Error initializing client data:', error);
  }
};

// Initialize data when the app starts
initializeClientData();
