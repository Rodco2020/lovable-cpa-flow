
/**
 * Mock service functions for client task component tests
 */

import { mockRecurringTasks, mockAdHocTasks } from './mockData';

// Mock the taskService module
export const mockTaskService = {
  getRecurringTasks: jest.fn().mockResolvedValue(mockRecurringTasks),
  deactivateRecurringTask: jest.fn().mockResolvedValue(true),
  getTaskInstances: jest.fn().mockResolvedValue([]),
  getRecurringTaskById: jest.fn().mockResolvedValue(null),
  updateRecurringTask: jest.fn().mockResolvedValue(true)
};

// Mock the clientService module
export const mockClientService = {
  getClientAdHocTasks: jest.fn().mockResolvedValue(mockAdHocTasks),
  getClientById: jest.fn().mockResolvedValue({}),
  deleteClient: jest.fn().mockResolvedValue(true)
};

export const setupMockServices = () => {
  jest.mock('@/services/taskService', () => mockTaskService);
  jest.mock('@/services/clientService', () => mockClientService);
};

export const resetMockServices = () => {
  Object.values(mockTaskService).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
  
  Object.values(mockClientService).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};
