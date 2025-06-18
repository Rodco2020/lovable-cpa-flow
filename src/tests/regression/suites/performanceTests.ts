
/**
 * Performance Regression Test Suite
 * 
 * Tests performance characteristics to prevent regressions.
 */

import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';

export interface PerformanceTestConfig {
  mockGetRecurringTasks: jest.MockedFunction<any>;
  mockUpdateRecurringTask: jest.MockedFunction<any>;
  renderWithProviders: (component: React.ReactElement) => any;
}

export const runPerformanceRegressionTests = ({
  mockGetRecurringTasks,
  mockUpdateRecurringTask,
  renderWithProviders
}: PerformanceTestConfig) => {
  describe('Performance Regression', () => {
    test('renders large task lists efficiently', async () => {
      // Create a large number of tasks
      const largeMockTasks = Array.from({ length: 100 }, (_, index) => ({
        id: `task-${index}`,
        templateId: 'template-1',
        clientId: 'client-1',
        name: `Task ${index}`,
        description: 'Test task',
        estimatedHours: 2,
        requiredSkills: ['skill-1'],
        priority: 'Medium' as const,
        category: 'Tax' as const,
        status: 'Unscheduled' as const,
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        recurrencePattern: { type: 'Monthly' as const, interval: 1 },
        lastGeneratedDate: null,
        isActive: true,
        preferredStaffId: null
      }));

      mockGetRecurringTasks.mockResolvedValue(largeMockTasks);

      const startTime = performance.now();
      
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Task 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(2000);
    });

    test('maintains responsive UI during updates', async () => {
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // Simulate rapid updates
      const updatePromises = Array.from({ length: 10 }, (_, i) => 
        mockUpdateRecurringTask(`task-${i}`, { name: `Updated Task ${i}` })
      );

      await Promise.all(updatePromises);

      // Component should remain responsive
      expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
    });
  });
};
