
import { getClientRecurringTasks, getClientAdHocTasks } from '../services/clientService';
import { getRecurringTasks, getTaskInstances } from '../services/taskService';

// Mock the task service functions
jest.mock('../services/taskService', () => ({
  getRecurringTasks: jest.fn(),
  getTaskInstances: jest.fn(),
}));

describe('Client Service - Task Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClientRecurringTasks', () => {
    it('should return recurring tasks for a specific client', async () => {
      // Mock data
      const mockRecurringTasks = [
        { id: 'task1', clientId: 'client1', name: 'Task 1' },
        { id: 'task2', clientId: 'client1', name: 'Task 2' },
        { id: 'task3', clientId: 'client2', name: 'Task 3' },
      ];
      
      // Setup mock implementation
      (getRecurringTasks as jest.Mock).mockReturnValue(mockRecurringTasks);
      
      // Execute
      const result = await getClientRecurringTasks('client1');
      
      // Verify
      expect(getRecurringTasks).toHaveBeenCalledWith(false);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task1');
      expect(result[1].id).toBe('task2');
    });
    
    it('should return empty array when no tasks match client ID', async () => {
      // Mock data
      const mockRecurringTasks = [
        { id: 'task1', clientId: 'client1', name: 'Task 1' },
        { id: 'task2', clientId: 'client1', name: 'Task 2' },
      ];
      
      // Setup mock implementation
      (getRecurringTasks as jest.Mock).mockReturnValue(mockRecurringTasks);
      
      // Execute
      const result = await getClientRecurringTasks('non-existent-client');
      
      // Verify
      expect(result).toHaveLength(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Setup mock implementation to throw an error
      (getRecurringTasks as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Execute
      const result = await getClientRecurringTasks('client1');
      
      // Verify
      expect(result).toHaveLength(0);
    });
  });
  
  describe('getClientAdHocTasks', () => {
    it('should return ad-hoc tasks for a specific client', async () => {
      // Mock data
      const mockTaskInstances = [
        { id: 'task1', clientId: 'client1', recurringTaskId: null },
        { id: 'task2', clientId: 'client1', recurringTaskId: 'rec1' },
        { id: 'task3', clientId: 'client1', recurringTaskId: null },
      ];
      
      // Setup mock implementation
      (getTaskInstances as jest.Mock).mockReturnValue(mockTaskInstances);
      
      // Execute
      const result = await getClientAdHocTasks('client1');
      
      // Verify
      expect(getTaskInstances).toHaveBeenCalledWith({ clientId: 'client1' });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task1');
      expect(result[2]).toBeUndefined();
    });
    
    it('should return empty array when no ad-hoc tasks exist', async () => {
      // Mock data - all tasks are from recurring tasks
      const mockTaskInstances = [
        { id: 'task1', clientId: 'client1', recurringTaskId: 'rec1' },
        { id: 'task2', clientId: 'client1', recurringTaskId: 'rec2' },
      ];
      
      // Setup mock implementation
      (getTaskInstances as jest.Mock).mockReturnValue(mockTaskInstances);
      
      // Execute
      const result = await getClientAdHocTasks('client1');
      
      // Verify
      expect(result).toHaveLength(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Setup mock implementation to throw an error
      (getTaskInstances as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Execute
      const result = await getClientAdHocTasks('client1');
      
      // Verify
      expect(result).toHaveLength(0);
    });
  });
});
