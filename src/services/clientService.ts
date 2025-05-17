
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientCreateParams, ClientUpdateParams } from '@/types/client';
import { RecurringTask, TaskInstance } from '@/types/task';

// Simulated client database
let clients: Client[] = [
  {
    id: '1',
    legalName: 'Acme Corporation',
    primaryContact: 'John Doe',
    email: 'john@acmecorp.com',
    phone: '555-123-4567',
    billingAddress: '123 Main St\nSuite 100\nNew York, NY 10001',
    industry: 'Manufacturing',
    status: 'Active',
    expectedMonthlyRevenue: 5000,
    paymentTerms: 'Net 30',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: true
    },
    createdAt: new Date(2022, 5, 15),
    updatedAt: new Date(2023, 1, 10)
  },
  {
    id: '2',
    legalName: 'Globex Corporation',
    primaryContact: 'Jane Smith',
    email: 'jane@globex.com',
    phone: '555-987-6543',
    billingAddress: '456 Tech Blvd\nSan Francisco, CA 94105',
    industry: 'Technology',
    status: 'Active',
    expectedMonthlyRevenue: 7500,
    paymentTerms: 'Net 15',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'High',
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: false
    },
    createdAt: new Date(2021, 8, 22),
    updatedAt: new Date(2023, 0, 5)
  },
  {
    id: '3',
    legalName: 'Oceanic Airlines',
    primaryContact: 'Kate Austin',
    email: 'kate@oceanic.com',
    phone: '555-111-2222',
    billingAddress: '789 Sky Lane\nLos Angeles, CA 90045',
    industry: 'Transportation',
    status: 'Inactive',
    expectedMonthlyRevenue: 12000,
    paymentTerms: 'Net 45',
    billingFrequency: 'Quarterly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: {
      emailReminders: false,
      taskNotifications: false
    },
    createdAt: new Date(2020, 3, 8),
    updatedAt: new Date(2022, 11, 15)
  }
];

// Sample recurring tasks (would come from task service in real app)
let clientRecurringTasks: Record<string, RecurringTask[]> = {
  '1': [
    {
      id: 'rt-1',
      templateId: '1',
      clientId: '1',
      name: 'Monthly Bookkeeping',
      description: 'Complete monthly bookkeeping tasks including reconciliation',
      estimatedHours: 3,
      requiredSkills: ['Bookkeeping'],
      priority: 'Medium',
      category: 'Accounting',
      dueDate: new Date(2023, 5, 15),
      recurrencePattern: { type: 'Monthly', dayOfMonth: 15 },
      status: 'Unscheduled',
      lastGeneratedDate: new Date(2023, 4, 15),
      isActive: true,
      createdAt: new Date(2022, 0, 1),
      updatedAt: new Date(2022, 0, 1)
    },
    {
      id: 'rt-2',
      templateId: '2',
      clientId: '1',
      name: 'Quarterly Tax Filing',
      description: 'Prepare and file quarterly tax returns',
      estimatedHours: 5,
      requiredSkills: ['CPA', 'Tax Specialist'],
      priority: 'High',
      category: 'Tax',
      dueDate: new Date(2023, 6, 15),
      recurrencePattern: { type: 'Quarterly', dayOfMonth: 15 },
      status: 'Unscheduled',
      lastGeneratedDate: new Date(2023, 3, 15),
      isActive: true,
      createdAt: new Date(2022, 0, 1),
      updatedAt: new Date(2022, 0, 1)
    }
  ],
  '2': [
    {
      id: 'rt-3',
      templateId: '3',
      clientId: '2',
      name: 'Annual Audit',
      description: 'Conduct annual financial audit',
      estimatedHours: 20,
      requiredSkills: ['CPA', 'Audit'],
      priority: 'Medium',
      category: 'Audit',
      dueDate: new Date(2023, 11, 1),
      recurrencePattern: { type: 'Annually', month: 11, dayOfMonth: 1 },
      status: 'Unscheduled',
      lastGeneratedDate: null,
      isActive: true,
      createdAt: new Date(2022, 0, 1),
      updatedAt: new Date(2022, 0, 1)
    }
  ]
};

// Sample ad-hoc tasks (would come from task service in real app)
let clientAdHocTasks: Record<string, TaskInstance[]> = {
  '1': [
    {
      id: 'task-1',
      templateId: '4',
      clientId: '1',
      recurringTaskId: null,
      name: 'Financial Statement Preparation',
      description: 'Prepare financial statements for stakeholders',
      estimatedHours: 8,
      requiredSkills: ['CPA'],
      priority: 'High',
      category: 'Accounting',
      dueDate: new Date(2023, 5, 30),
      status: 'Unscheduled',
      assignedStaffId: null,
      scheduledStartTime: null,
      scheduledEndTime: null,
      completedAt: null,
      createdAt: new Date(2023, 5, 1),
      updatedAt: new Date(2023, 5, 1)
    }
  ],
  '2': [
    {
      id: 'task-2',
      templateId: '5',
      clientId: '2',
      recurringTaskId: null,
      name: 'Business Advisory Meeting',
      description: 'Strategic planning and business advisory session',
      estimatedHours: 2,
      requiredSkills: ['Advisory'],
      priority: 'Medium',
      category: 'Advisory',
      dueDate: new Date(2023, 5, 15),
      status: 'Scheduled',
      assignedStaffId: 'staff-1',
      scheduledStartTime: new Date(2023, 5, 15, 10, 0),
      scheduledEndTime: new Date(2023, 5, 15, 12, 0),
      completedAt: null,
      createdAt: new Date(2023, 5, 1),
      updatedAt: new Date(2023, 5, 1)
    },
    {
      id: 'task-3',
      templateId: '1',
      clientId: '2',
      recurringTaskId: null,
      name: 'Special Bookkeeping Review',
      description: 'Review bookkeeping for the acquisition',
      estimatedHours: 4,
      requiredSkills: ['Bookkeeping', 'CPA'],
      priority: 'Urgent',
      category: 'Accounting',
      dueDate: new Date(2023, 5, 10),
      status: 'Completed',
      assignedStaffId: 'staff-2',
      scheduledStartTime: new Date(2023, 5, 8, 9, 0),
      scheduledEndTime: new Date(2023, 5, 8, 13, 0),
      completedAt: new Date(2023, 5, 8, 12, 30),
      createdAt: new Date(2023, 5, 5),
      updatedAt: new Date(2023, 5, 8)
    }
  ]
};

/**
 * Get all clients
 * @returns Promise with array of clients
 */
export const getAllClients = async (): Promise<Client[]> => {
  return Promise.resolve(clients);
};

/**
 * Get a specific client by ID
 * @param id Client ID to retrieve
 * @returns Promise with the client or null if not found
 */
export const getClientById = async (id: string): Promise<Client | null> => {
  const client = clients.find(c => c.id === id);
  return Promise.resolve(client || null);
};

/**
 * Create a new client
 * @param clientData Data for the new client
 * @returns Promise with the created client
 */
export const createClient = async (clientData: ClientCreateParams): Promise<Client> => {
  const now = new Date();
  
  const newClient: Client = {
    id: uuidv4(),
    ...clientData,
    createdAt: now,
    updatedAt: now
  };
  
  clients.push(newClient);
  clientRecurringTasks[newClient.id] = [];
  clientAdHocTasks[newClient.id] = [];
  
  return Promise.resolve(newClient);
};

/**
 * Update an existing client
 * @param id Client ID to update
 * @param clientData Updated client data
 * @returns Promise with the updated client
 */
export const updateClient = async (id: string, clientData: ClientUpdateParams): Promise<Client | null> => {
  const clientIndex = clients.findIndex(c => c.id === id);
  
  if (clientIndex === -1) {
    return Promise.resolve(null);
  }
  
  clients[clientIndex] = {
    ...clients[clientIndex],
    ...clientData,
    updatedAt: new Date()
  };
  
  return Promise.resolve(clients[clientIndex]);
};

/**
 * Delete a client
 * @param id Client ID to delete
 * @returns Promise with boolean indicating success
 */
export const deleteClient = async (id: string): Promise<boolean> => {
  const initialLength = clients.length;
  clients = clients.filter(c => c.id !== id);
  
  delete clientRecurringTasks[id];
  delete clientAdHocTasks[id];
  
  return Promise.resolve(clients.length < initialLength);
};

/**
 * Get recurring tasks for a specific client
 * @param clientId Client ID to get tasks for
 * @returns Promise with array of recurring tasks
 */
export const getClientRecurringTasks = async (clientId: string): Promise<RecurringTask[]> => {
  return Promise.resolve(clientRecurringTasks[clientId] || []);
};

/**
 * Get ad-hoc tasks for a specific client
 * @param clientId Client ID to get tasks for
 * @returns Promise with array of ad-hoc tasks
 */
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstance[]> => {
  return Promise.resolve(clientAdHocTasks[clientId] || []);
};

/**
 * Get all active clients
 * @returns Promise with array of active clients
 */
export const getActiveClients = async (): Promise<Client[]> => {
  return Promise.resolve(clients.filter(client => client.status === 'Active'));
};
