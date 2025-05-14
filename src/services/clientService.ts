
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientStatus, IndustryType } from '@/types/client';

// Mock data storage
let clients: Client[] = [];

// Client CRUD operations
export const getClients = (filters?: {
  status?: ClientStatus[];
  industry?: IndustryType[];
}): Client[] => {
  let filteredClients = [...clients];
  
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      filteredClients = filteredClients.filter(c => 
        filters.status?.includes(c.status)
      );
    }
    if (filters.industry && filters.industry.length > 0) {
      filteredClients = filteredClients.filter(c => 
        filters.industry?.includes(c.industry)
      );
    }
  }
  
  return filteredClients;
};

export const getClientById = (id: string): Client | undefined => {
  return clients.find(c => c.id === id);
};

export const createClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
  const newClient: Client = {
    ...client,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  clients.push(newClient);
  return newClient;
};

export const updateClient = (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Client | null => {
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  clients[index] = {
    ...clients[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return clients[index];
};

export const deleteClient = (id: string): boolean => {
  const initialLength = clients.length;
  clients = clients.filter(c => c.id !== id);
  
  return clients.length !== initialLength;
};

// Client engagement tracking
export const getClientRecurringTasks = (clientId: string): string[] => {
  // In a real implementation, this would query the task service
  // For now, returning a placeholder
  return ["task-id-1", "task-id-2"];
};

export const getClientAdHocTasks = (clientId: string): string[] => {
  // In a real implementation, this would query the task service
  // For now, returning a placeholder
  return ["task-id-3", "task-id-4"];
};

// Initialize with sample data
export const initializeClientData = () => {
  // Create sample clients
  createClient({
    legalName: "ABC Corporation",
    primaryContact: "John Smith",
    email: "john@abccorp.com",
    phone: "(555) 123-4567",
    billingAddress: "123 Business Ave, Suite 100, New York, NY 10001",
    industry: "Technology",
    status: "Active",
    expectedMonthlyRevenue: 5000,
    paymentTerms: "Net30",
    billingFrequency: "Monthly",
    defaultTaskPriority: "Medium",
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: true
    }
  });
  
  createClient({
    legalName: "XYZ Enterprises",
    primaryContact: "Sarah Johnson",
    email: "sarah@xyzent.com",
    phone: "(555) 987-6543",
    billingAddress: "456 Commerce St, Chicago, IL 60601",
    industry: "Manufacturing",
    status: "Active",
    expectedMonthlyRevenue: 8500,
    paymentTerms: "Net45",
    billingFrequency: "Quarterly",
    defaultTaskPriority: "High",
    notificationPreferences: {
      emailReminders: true,
      taskNotifications: false
    }
  });
  
  createClient({
    legalName: "Acme Consulting",
    primaryContact: "Michael Brown",
    email: "michael@acmeconsulting.com",
    phone: "(555) 456-7890",
    billingAddress: "789 Professional Dr, Austin, TX 78701",
    industry: "Professional Services",
    status: "Inactive",
    expectedMonthlyRevenue: 3200,
    paymentTerms: "Net30",
    billingFrequency: "Monthly",
    defaultTaskPriority: "Medium",
    notificationPreferences: {
      emailReminders: false,
      taskNotifications: true
    }
  });
};

// Initialize data on module import
initializeClientData();
