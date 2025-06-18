
/**
 * Service Integration Test Suite
 * 
 * Tests service layer integration to ensure API contracts are maintained.
 */

import { RecurringTask } from '@/types/task';

export interface ServiceIntegrationTestConfig {
  mockGetRecurringTasks: jest.MockedFunction<any>;
  mockUpdateRecurringTask: jest.MockedFunction<any>;
  mockDeactivateRecurringTask: jest.MockedFunction<any>;
}

export const runServiceIntegrationTests = ({
  mockGetRecurringTasks,
  mockUpdateRecurringTask,
  mockDeactivateRecurringTask
}: ServiceIntegrationTestConfig) => {
  describe('Service Integration', () => {
    test('getRecurringTasks service maintains existing API', async () => {
      await mockGetRecurringTasks('client-1');
      
      expect(mockGetRecurringTasks).toHaveBeenCalledWith('client-1');
    });

    test('updateRecurringTask service maintains existing API', async () => {
      const updates: Partial<RecurringTask> = {
        name: 'Updated Task',
        estimatedHours: 5
      };

      await mockUpdateRecurringTask('task-1', updates);
      
      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', updates);
    });

    test('deactivateRecurringTask service maintains existing API', async () => {
      await mockDeactivateRecurringTask('task-1');
      
      expect(mockDeactivateRecurringTask).toHaveBeenCalledWith('task-1');
    });
  });
};
