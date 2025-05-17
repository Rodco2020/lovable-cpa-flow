
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency, ClientCreateParams, ClientUpdateParams } from '@/types/client';
import { TaskCategory, RecurringTask } from '@/types/task';
import { createRecurringTask } from '@/services/taskService';

// Mock client data
const clients: Client[] = [
  {
    id: '1',
    legalName: 'Acme Corporation',
    primaryContact: 'John Doe',
    email: 'john@acme.com',
    phone: '555-123-4567',
    billingAddress: '123 Main St, Business City, CA 90210',
    industry: 'Technology',
    status: 'Active',
    expectedMonthlyRevenue: 5000,
    paymentTerms: 'Net30',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: true
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-04-20')
  },
  {
    id: '2',
    legalName: 'Globex Industries',
    primaryContact: 'Jane Smith',
    email: 'jane@globex.com',
    phone: '555-987-6543',
    billingAddress: '456 Commerce Ave, Metro City, NY 10001',
    industry: 'Manufacturing',
    status: 'Active',
    expectedMonthlyRevenue: 7500,
    paymentTerms: 'Net15',
    billingFrequency: 'Quarterly',
    defaultTaskPriority: 'High',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: false
    },
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-05-05')
  },
  {
    id: '3',
    legalName: 'Sunshine Transportation',
    primaryContact: 'Bob Johnson',
    email: 'bob@sunshine.com',
    phone: '555-456-7890',
    billingAddress: '789 Logistics Pkwy, Harbor City, FL 33101',
    industry: 'Transportation',
    status: 'Inactive',
    expectedMonthlyRevenue: 3000,
    paymentTerms: 'Net45',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Low',
    notificationPreferences: {
      emailReminders: false,
      taskNotifications: false
    },
    createdAt: new Date('2022-11-05'),
    updatedAt: new Date('2023-03-15')
  }
];

// Get all clients (with optional filtering)
export const getAllClients = async (activeOnly = false): Promise<Client[]> => {
  if (activeOnly) {
    return clients.filter(client => client.status === 'Active');
  }
  return [...clients];
};

// Get active clients
export const getActiveClients = async (): Promise<Client[]> => {
  return clients.filter(client => client.status === 'Active');
};

// Get client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
  const client = clients.find(c => c.id === id);
  return client || null;
};

// Create a new client
export const createClient = async (clientData: ClientCreateParams): Promise<Client> => {
  const newClient: Client = {
    ...clientData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  clients.push(newClient);
  
  // Create default recurring tasks for the new client (example)
  await createRecurringTask({
    templateId: '1',
    clientId: newClient.id,
    name: 'Monthly Bookkeeping',
    description: 'Regular monthly bookkeeping service',
    status: 'Unscheduled',
    estimatedHours: 4,
    requiredSkills: ['Bookkeeping'],
    priority: newClient.defaultTaskPriority,
    category: 'Bookkeeping',
    recurrenceType: 'monthly',
    recurrenceInterval: 1,
    dayOfMonth: 15
  });
  
  return newClient;
};

// Update an existing client
export const updateClient = async (id: string, updates: ClientUpdateParams): Promise<Client | null> => {
  const index = clients.findIndex(c => c.id === id);
  
  if (index === -1) {
    return null;
  }
  
  clients[index] = {
    ...clients[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return clients[index];
};

// Archive a client (set status to Archived)
export const archiveClient = async (id: string): Promise<Client | null> => {
  const index = clients.findIndex(c => c.id === id);
  
  if (index === -1) {
    return null;
  }
  
  clients[index] = {
    ...clients[index],
    status: 'Archived',
    updatedAt: new Date()
  };
  
  return clients[index];
};

// Get client finance summary
export const getClientFinanceSummary = async (id: string) => {
  const client = await getClientById(id);
  
  if (!client) {
    return null;
  }
  
  // Just mock data for now - would be calculated from actual invoices/payments
  return {
    clientId: client.id,
    totalRevenue: client.expectedMonthlyRevenue * 12, // Annualized
    outstandingAmount: client.expectedMonthlyRevenue * 0.75,
    averagePaymentTime: 22, // days
    revenueHistory: [
      { month: 'Jan', amount: client.expectedMonthlyRevenue * 0.9 },
      { month: 'Feb', amount: client.expectedMonthlyRevenue * 1.1 },
      { month: 'Mar', amount: client.expectedMonthlyRevenue * 0.95 }
    ]
  };
};

// Search for clients
export const searchClients = async (query: string): Promise<Client[]> => {
  const lowerQuery = query.toLowerCase();
  
  return clients.filter(
    client =>
      client.legalName.toLowerCase().includes(lowerQuery) ||
      client.primaryContact.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery)
  );
};

// Get all industries as choices for UI
export const getIndustryChoices = (): IndustryType[] => {
  return [
    'Retail',
    'Healthcare',
    'Manufacturing',
    'Technology',
    'Financial Services',
    'Professional Services',
    'Construction',
    'Hospitality',
    'Education',
    'Non-Profit',
    'Transportation',
    'Other'
  ];
};
