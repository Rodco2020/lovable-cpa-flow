import { supabase } from '@/lib/supabaseClient';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { RecurringTask, TaskInstance, RecurringTaskCreateParams } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

// Get all clients
export const getAllClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('legal_name');
      
    if (error) throw error;
    
    return data.map(client => ({
      id: client.id,
      legalName: client.legal_name,
      primaryContact: client.primary_contact,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billing_address,
      industry: client.industry as IndustryType,
      status: client.status as ClientStatus,
      expectedMonthlyRevenue: client.expected_monthly_revenue,
      paymentTerms: client.payment_terms as PaymentTerms,
      billingFrequency: client.billing_frequency as BillingFrequency,
      defaultTaskPriority: client.default_task_priority as "Low" | "Medium" | "High" | "Urgent",
      notificationPreferences: client.notification_preferences,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

// Alias for getAllClients for backward compatibility
export const getClients = getAllClients;

// Get client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
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
      paymentTerms: data.payment_terms as PaymentTerms,
      billingFrequency: data.billing_frequency as BillingFrequency,
      defaultTaskPriority: data.default_task_priority as "Low" | "Medium" | "High" | "Urgent",
      notificationPreferences: data.notification_preferences,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
};

// Create client
export const createClient = async (client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
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
          notification_preferences: client.notificationPreferences
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
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
      paymentTerms: data.payment_terms as PaymentTerms,
      billingFrequency: data.billing_frequency as BillingFrequency,
      defaultTaskPriority: data.default_task_priority as "Low" | "Medium" | "High" | "Urgent",
      notificationPreferences: data.notification_preferences,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating client:', error);
    return null;
  }
};

// Update client
export const updateClient = async (id: string, updates: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>): Promise<Client | null> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.legalName) updateData.legal_name = updates.legalName;
    if (updates.primaryContact) updateData.primary_contact = updates.primaryContact;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.billingAddress) updateData.billing_address = updates.billingAddress;
    if (updates.industry) updateData.industry = updates.industry;
    if (updates.status) updateData.status = updates.status;
    if (updates.expectedMonthlyRevenue !== undefined) updateData.expected_monthly_revenue = updates.expectedMonthlyRevenue;
    if (updates.paymentTerms) updateData.payment_terms = updates.paymentTerms;
    if (updates.billingFrequency) updateData.billing_frequency = updates.billingFrequency;
    if (updates.defaultTaskPriority) updateData.default_task_priority = updates.defaultTaskPriority;
    if (updates.notificationPreferences) updateData.notification_preferences = updates.notificationPreferences;
    
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
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
      paymentTerms: data.payment_terms as PaymentTerms,
      billingFrequency: data.billing_frequency as BillingFrequency,
      defaultTaskPriority: data.default_task_priority as "Low" | "Medium" | "High" | "Urgent",
      notificationPreferences: data.notification_preferences,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
};

// Delete client
export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
};

// Get client recurring tasks
export const getClientRecurringTasks = async (clientId: string): Promise<RecurringTask[]> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId);
      
    if (error) throw error;
    
    return data.map(task => ({
      id: task.id,
      clientId: task.client_id,
      name: task.name,
      description: task.description || '',
      templateId: task.template_id,
      isActive: task.is_active,
      requiredSkills: task.required_skills,
      priority: task.priority as "Low" | "Medium" | "High" | "Urgent",
      estimatedHours: task.estimated_hours,
      category: task.category,
      recurrencePattern: {
        type: task.recurrence_type,
        interval: task.recurrence_interval,
        weekdays: task.weekdays,
        dayOfMonth: task.day_of_month,
        monthOfYear: task.month_of_year,
        customOffsetDays: task.custom_offset_days
      },
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      lastGeneratedDate: task.last_generated_date ? new Date(task.last_generated_date) : undefined,
      endDate: task.end_date ? new Date(task.end_date) : undefined,
      notes: task.notes || '',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching client recurring tasks:', error);
    return [];
  }
};

// Get client ad-hoc tasks
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId)
      .is('recurring_task_id', null); // Only get ad-hoc tasks
      
    if (error) throw error;
    
    return data.map(task => ({
      id: task.id,
      clientId: task.client_id,
      name: task.name,
      description: task.description || '',
      templateId: task.template_id,
      recurringTaskId: task.recurring_task_id,
      requiredSkills: task.required_skills,
      priority: task.priority as "Low" | "Medium" | "High" | "Urgent",
      estimatedHours: task.estimated_hours,
      category: task.category,
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      assignedStaffId: task.assigned_staff_id,
      scheduledStartTime: task.scheduled_start_time ? new Date(task.scheduled_start_time) : undefined,
      scheduledEndTime: task.scheduled_end_time ? new Date(task.scheduled_end_time) : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      notes: task.notes || '',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching client ad-hoc tasks:', error);
    return [];
  }
};

// Mock data and utility functions for client list
const mockClients = [
  {
    id: '1',
    legalName: 'Acme Corp',
    primaryContact: 'John Doe',
    email: 'john.doe@acme.com',
    phone: '555-123-4567',
    billingAddress: '123 Main St, Anytown, USA',
    industry: 'Technology',
    status: 'Active',
    expectedMonthlyRevenue: 50000,
    paymentTerms: 'Net30',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    legalName: 'Beta Industries',
    primaryContact: 'Jane Smith',
    email: 'jane.smith@beta.com',
    phone: '555-987-6543',
    billingAddress: '456 Elm St, Anytown, USA',
    industry: 'Manufacturing',
    status: 'Inactive',
    expectedMonthlyRevenue: 25000,
    paymentTerms: 'Net45',
    billingFrequency: 'Quarterly',
    defaultTaskPriority: 'Low',
    notificationPreferences: {
      emailReminders: false,
      taskNotifications: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    legalName: 'Gamma Solutions',
    primaryContact: 'Alice Johnson',
    email: 'alice.johnson@gamma.com',
    phone: '555-246-1357',
    billingAddress: '789 Oak St, Anytown, USA',
    industry: 'Financial Services',
    status: 'Pending',
    expectedMonthlyRevenue: 75000,
    paymentTerms: 'Net60',
    billingFrequency: 'Annually',
    defaultTaskPriority: 'High',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    legalName: 'Delta Corp',
    primaryContact: 'Bob Williams',
    email: 'bob.williams@delta.com',
    phone: '555-864-2468',
    billingAddress: '101 Pine St, Anytown, USA',
    industry: 'Healthcare',
    status: 'Active',
    expectedMonthlyRevenue: 60000,
    paymentTerms: 'Net30',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    legalName: 'Epsilon Systems',
    primaryContact: 'Carol Davis',
    email: 'carol.davis@epsilon.com',
    phone: '555-369-8521',
    billingAddress: '222 Cedar St, Anytown, USA',
    industry: 'Technology',
    status: 'Active',
    expectedMonthlyRevenue: 90000,
    paymentTerms: 'Net15',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Urgent',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getMockClients = (): Client[] => {
  return mockClients;
};

export const getMockClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};
