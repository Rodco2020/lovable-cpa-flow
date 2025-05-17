
import { supabase } from '@/lib/supabaseClient';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { RecurringTask, TaskInstance, RecurrencePattern } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for client creation and update
export type ClientCreateParams = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type ClientUpdateParams = Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>;

// Get all clients
export async function getAllClients(): Promise<Client[]> {
  try {
    // In a real application, this would fetch from the database
    // For now, return mock data
    return getMockClients();
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

// Alias for getAllClients for backward compatibility
export const getClients = getAllClients;

// Get client by ID
export async function getClientById(id: string): Promise<Client | null> {
  try {
    const clients = getMockClients();
    const client = clients.find(c => c.id === id);
    return client || null;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

// Create client
export async function createClient(client: ClientCreateParams): Promise<Client | null> {
  try {
    // In a real application, this would create a record in the database
    const newClient: Client = {
      id: uuidv4(),
      ...client,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Created client:', newClient);
    return newClient;
  } catch (error) {
    console.error('Error creating client:', error);
    return null;
  }
}

// Update client
export async function updateClient(id: string, updates: ClientUpdateParams): Promise<Client | null> {
  try {
    const client = await getClientById(id);
    if (!client) return null;
    
    const updatedClient: Client = {
      ...client,
      ...updates,
      updatedAt: new Date()
    };
    
    console.log('Updated client:', updatedClient);
    return updatedClient;
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
}

// Delete client
export async function deleteClient(id: string): Promise<boolean> {
  try {
    // In a real application, this would delete the client from the database
    console.log('Deleted client:', id);
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
}

// Get client recurring tasks
export async function getClientRecurringTasks(clientId: string): Promise<RecurringTask[]> {
  try {
    const allRecurringTasks = await getRecurringTasks(false);
    return allRecurringTasks.filter(task => task.clientId === clientId);
  } catch (error) {
    console.error('Error fetching client recurring tasks:', error);
    return [];
  }
}

// Get client ad-hoc tasks
export async function getClientAdHocTasks(clientId: string): Promise<TaskInstance[]> {
  try {
    const taskInstances = await getTaskInstances({ clientId });
    return taskInstances.filter(task => !task.recurringTaskId);
  } catch (error) {
    console.error('Error fetching client ad-hoc tasks:', error);
    return [];
  }
}

// Define stub functions to satisfy import usage
async function getRecurringTasks(includeInactive: boolean = false): Promise<RecurringTask[]> {
  try {
    // Mock data for recurring tasks
    const tasks: RecurringTask[] = [
      {
        id: '1',
        templateId: '1',
        clientId: 'client1',
        name: 'Monthly Bookkeeping - ABC Corp',
        description: 'Reconcile accounts and prepare monthly financial statements',
        estimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Unscheduled',
        dueDate: new Date('2023-06-15'),
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15'),
        recurrencePattern: {
          type: 'Monthly',
          dayOfMonth: 15
        },
        lastGeneratedDate: null,
        isActive: true
      },
      {
        id: '2',
        templateId: '2',
        clientId: 'client1',
        name: 'Quarterly Tax Filing - ABC Corp',
        description: 'Prepare and submit quarterly tax returns',
        estimatedHours: 5,
        requiredSkills: ['Tax'],
        priority: 'High',
        category: 'Tax',
        status: 'Unscheduled',
        dueDate: new Date('2023-07-15'),
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15'),
        recurrencePattern: {
          type: 'Quarterly',
          dayOfMonth: 15
        },
        lastGeneratedDate: null,
        isActive: true
      },
      {
        id: '3',
        templateId: '1',
        clientId: 'client2',
        name: 'Monthly Bookkeeping - XYZ Inc',
        description: 'Reconcile accounts and prepare monthly financial statements',
        estimatedHours: 4,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Unscheduled',
        dueDate: new Date('2023-06-20'),
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15'),
        recurrencePattern: {
          type: 'Monthly',
          dayOfMonth: 20
        },
        lastGeneratedDate: null,
        isActive: false
      }
    ];
    
    return includeInactive ? tasks : tasks.filter(t => t.isActive);
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    return [];
  }
}

async function getTaskInstances(filter: { clientId?: string, status?: string }): Promise<TaskInstance[]> {
  try {
    // Mock data for task instances
    const tasks: TaskInstance[] = [
      {
        id: '1',
        templateId: '1',
        clientId: filter.clientId || 'client1',
        name: 'May Bookkeeping - ABC Corp',
        description: 'Reconcile accounts and prepare monthly financial statements for May',
        estimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Completed',
        dueDate: new Date('2023-05-15'),
        createdAt: new Date('2023-05-01'),
        updatedAt: new Date('2023-05-16'),
        completedAt: new Date('2023-05-14'),
        recurringTaskId: '1'
      },
      {
        id: '2',
        templateId: '1',
        clientId: filter.clientId || 'client1',
        name: 'June Bookkeeping - ABC Corp',
        description: 'Reconcile accounts and prepare monthly financial statements for June',
        estimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Scheduled',
        dueDate: new Date('2023-06-15'),
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
        recurringTaskId: '1',
        assignedStaffId: 'staff1',
        scheduledStartTime: new Date('2023-06-14T10:00:00'),
        scheduledEndTime: new Date('2023-06-14T13:00:00')
      },
      {
        id: '3',
        templateId: '2',
        clientId: filter.clientId || 'client1',
        name: 'Q2 Tax Filing - ABC Corp',
        description: 'Prepare and submit Q2 tax returns',
        estimatedHours: 5,
        requiredSkills: ['Tax'],
        priority: 'High',
        category: 'Tax',
        status: 'Unscheduled',
        dueDate: new Date('2023-07-15'),
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2023-06-15'),
        recurringTaskId: '2'
      },
      {
        id: '4',
        templateId: '3',
        clientId: filter.clientId || 'client1',
        name: 'Special Advisory Project',
        description: 'One-time strategic advisory session',
        estimatedHours: 10,
        requiredSkills: ['Advisory'],
        priority: 'Medium',
        category: 'Advisory',
        status: 'Scheduled',
        dueDate: new Date('2023-06-20'),
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-02'),
        assignedStaffId: 'staff2',
        scheduledStartTime: new Date('2023-06-19T09:00:00'),
        scheduledEndTime: new Date('2023-06-19T19:00:00')
      }
    ];
    
    return tasks.filter(t => {
      if (filter.clientId && t.clientId !== filter.clientId) return false;
      if (filter.status && t.status !== filter.status) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching task instances:', error);
    return [];
  }
}

// Mock data and utility functions for client list
export function getMockClients(): Client[] {
  return [
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
      paymentTerms: 'Net15',
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
      paymentTerms: 'Net45',
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
}
