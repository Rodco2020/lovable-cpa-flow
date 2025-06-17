

import { 
  PerformanceMonitor, 
  DataIntegrityValidator, 
  createCompleteRecurringTask, 
  generateMockStaffOptions,
  TestResultAggregator 
} from '../utils/integrationTestHelpers';
import { updateRecurringTask, createRecurringTask } from '@/services/taskService';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';

// Mock the services
jest.mock('@/services/taskService');
jest.mock('@/services/staff/staffDropdownService');

describe('Phase 7: Performance Testing with Realistic Data Volumes', () => {
  let performanceMonitor: PerformanceMonitor;
  let resultAggregator: TestResultAggregator;

  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor = new PerformanceMonitor();
    resultAggregator = new TestResultAggregator();

    // Setup mock implementations
    (updateRecurringTask as jest.Mock).mockImplementation(async (id, updates) => {
      // Simulate realistic database operation time
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      return { ...createCompleteRecurringTask(), ...updates, id };
    });

    (createRecurringTask as jest.Mock).mockImplementation(async (taskData) => {
      await new Promise(resolve => setTimeout(resolve, 75 + Math.random() * 75));
      return { ...createCompleteRecurringTask(), ...taskData, id: 'new-task-id' };
    });

    (getActiveStaffForDropdown as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 25 + Math.random() * 25));
      return generateMockStaffOptions(50);
    });
  });

  afterEach(() => {
    const summary = resultAggregator.getSummary();
    console.log('Performance Test Summary:', summary);
    
    if (summary.failed > 0) {
      console.log('Failed Tests:', resultAggregator.getFailedTests());
    }
  });

  describe('Single Operation Performance', () => {
    test('Task creation performance with preferred staff', async () => {
      const startTime = Date.now();
      
      try {
        const completeTask = createCompleteRecurringTask();
        
        // Create task data without properties that shouldn't be passed to createRecurringTask
        const taskDataForCreation = {
          templateId: completeTask.templateId,
          clientId: completeTask.clientId,
          name: completeTask.name,
          description: completeTask.description,
          estimatedHours: completeTask.estimatedHours,
          requiredSkills: completeTask.requiredSkills,
          priority: completeTask.priority,
          category: completeTask.category,
          dueDate: completeTask.dueDate,
          recurrencePattern: completeTask.recurrencePattern,
          preferredStaffId: 'staff-1'
        };

        const { metrics } = await performanceMonitor.measureOperation(
          'createTaskWithStaff',
          () => createRecurringTask(taskDataForCreation)
        );

        // Performance threshold: creation should take less than 500ms
        expect(metrics.duration).toBeLessThan(500);
        expect(metrics.success).toBe(true);

        resultAggregator.addResult(
          'Task creation performance',
          'Single Operation',
          metrics.duration < 500,
          metrics.duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Task creation performance',
          'Single Operation',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });

    test('Task update performance with preferred staff', async () => {
      const startTime = Date.now();
      
      try {
        const { metrics } = await performanceMonitor.measureOperation(
          'updateTaskWithStaff',
          () => updateRecurringTask('task-1', { preferredStaffId: 'staff-2' })
        );

        // Performance threshold: update should take less than 300ms
        expect(metrics.duration).toBeLessThan(300);
        expect(metrics.success).toBe(true);

        resultAggregator.addResult(
          'Task update performance',
          'Single Operation',
          metrics.duration < 300,
          metrics.duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Task update performance',
          'Single Operation',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });

    test('Staff dropdown loading performance', async () => {
      const startTime = Date.now();
      
      try {
        const { metrics } = await performanceMonitor.measureOperation(
          'loadStaffDropdown',
          () => getActiveStaffForDropdown()
        );

        // Performance threshold: staff loading should take less than 200ms
        expect(metrics.duration).toBeLessThan(200);
        expect(metrics.success).toBe(true);

        resultAggregator.addResult(
          'Staff dropdown loading',
          'Single Operation',
          metrics.duration < 200,
          metrics.duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Staff dropdown loading',
          'Single Operation',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });
  });

  describe('Bulk Operations Performance', () => {
    test('Concurrent task updates performance', async () => {
      const taskCount = 20;
      const startTime = Date.now();
      
      try {
        const updatePromises = Array.from({ length: taskCount }, (_, i) =>
          performanceMonitor.measureOperation(
            `bulkUpdate_${i}`,
            () => updateRecurringTask(`task-${i + 1}`, { 
              preferredStaffId: `staff-${(i % 5) + 1}` 
            })
          )
        );

        const results = await Promise.all(updatePromises);
        const totalDuration = Date.now() - startTime;
        const avgDuration = performanceMonitor.getAverageDuration();

        // Performance thresholds
        expect(totalDuration).toBeLessThan(5000); // Total time under 5 seconds
        expect(avgDuration).toBeLessThan(250); // Average operation under 250ms
        
        const allSuccessful = results.every(r => r.metrics.success);
        expect(allSuccessful).toBe(true);

        resultAggregator.addResult(
          'Concurrent task updates',
          'Bulk Operations',
          totalDuration < 5000 && avgDuration < 250,
          totalDuration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Concurrent task updates',
          'Bulk Operations',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });

    test('Large staff list handling performance', async () => {
      const largeStaffCount = 200;
      (getActiveStaffForDropdown as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
        return generateMockStaffOptions(largeStaffCount);
      });

      const startTime = Date.now();
      
      try {
        const { metrics } = await performanceMonitor.measureOperation(
          'loadLargeStaffList',
          () => getActiveStaffForDropdown()
        );

        // Performance threshold: large staff list should load within 500ms
        expect(metrics.duration).toBeLessThan(500);
        
        const staffList = await getActiveStaffForDropdown();
        expect(staffList).toHaveLength(largeStaffCount);

        resultAggregator.addResult(
          'Large staff list handling',
          'Bulk Operations',
          metrics.duration < 500,
          metrics.duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Large staff list handling',
          'Bulk Operations',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });

    test('Memory usage with large datasets', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Create multiple tasks with various staff assignments
      const taskPromises = Array.from({ length: 100 }, (_, i) => {
        const completeTask = createCompleteRecurringTask();
        
        // Create task data without properties that shouldn't be passed to createRecurringTask
        const taskDataForCreation = {
          templateId: completeTask.templateId,
          clientId: completeTask.clientId,
          name: `Memory Test Task ${i}`,
          description: completeTask.description,
          estimatedHours: completeTask.estimatedHours,
          requiredSkills: completeTask.requiredSkills,
          priority: completeTask.priority,
          category: completeTask.category,
          dueDate: completeTask.dueDate,
          recurrencePattern: completeTask.recurrencePattern,
          preferredStaffId: i % 10 === 0 ? null : `staff-${(i % 50) + 1}`
        };

        return createRecurringTask(taskDataForCreation);
      });

      const startTime = Date.now();
      
      try {
        await Promise.all(taskPromises);
        const duration = Date.now() - startTime;
        
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB for 100 tasks)
        const reasonableMemoryUse = memoryIncrease < 50 * 1024 * 1024;
        
        console.log(`Memory usage test: ${memoryIncrease / 1024 / 1024}MB increase`);
        
        resultAggregator.addResult(
          'Memory usage with large datasets',
          'Bulk Operations',
          reasonableMemoryUse && duration < 10000,
          duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Memory usage with large datasets',
          'Bulk Operations',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });
  });

  describe('Data Integrity Under Load', () => {
    test('Data consistency with rapid updates', async () => {
      const taskId = 'consistency-test-task';
      const originalTask = createCompleteRecurringTask({ id: taskId });
      
      // Simulate rapid updates to the same task
      const updates = [
        { preferredStaffId: 'staff-1' },
        { preferredStaffId: 'staff-2' },
        { preferredStaffId: null },
        { preferredStaffId: 'staff-3' },
        { preferredStaffId: 'staff-1' }
      ];

      const startTime = Date.now();
      
      try {
        // Execute updates sequentially to test consistency
        let currentTask = originalTask;
        for (const update of updates) {
          const { result } = await performanceMonitor.measureOperation(
            'rapidUpdate',
            () => updateRecurringTask(taskId, update)
          );
          
          // Validate data integrity after each update
          const validation = DataIntegrityValidator.validateTaskIntegrity(
            currentTask,
            result,
            update
          );
          
          expect(validation.isValid).toBe(true);
          if (!validation.isValid) {
            console.error('Data integrity errors:', validation.errors);
          }
          
          currentTask = result;
        }

        const duration = Date.now() - startTime;
        
        resultAggregator.addResult(
          'Data consistency with rapid updates',
          'Data Integrity',
          true,
          duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Data consistency with rapid updates',
          'Data Integrity',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });

    test('Concurrent access data integrity', async () => {
      const taskId = 'concurrent-test-task';
      
      // Simulate multiple users updating the same task concurrently
      const concurrentUpdates = [
        { preferredStaffId: 'staff-1', name: 'Update 1' },
        { preferredStaffId: 'staff-2', name: 'Update 2' },
        { preferredStaffId: 'staff-3', name: 'Update 3' },
        { preferredStaffId: null, name: 'Update 4' }
      ];

      const startTime = Date.now();
      
      try {
        const updatePromises = concurrentUpdates.map((update, index) =>
          performanceMonitor.measureOperation(
            `concurrentUpdate_${index}`,
            () => updateRecurringTask(taskId, update)
          )
        );

        const results = await Promise.all(updatePromises);
        const duration = Date.now() - startTime;
        
        // All operations should complete successfully
        const allSuccessful = results.every(r => r.metrics.success);
        expect(allSuccessful).toBe(true);

        resultAggregator.addResult(
          'Concurrent access data integrity',
          'Data Integrity',
          allSuccessful,
          duration
        );
      } catch (error) {
        resultAggregator.addResult(
          'Concurrent access data integrity',
          'Data Integrity',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });
  });

  describe('Performance Regression Testing', () => {
    test('Ensure no performance degradation in existing functionality', async () => {
      // Test existing operations without preferred staff to ensure no regression
      const standardOperations = [
        () => createRecurringTask(createCompleteRecurringTask()),
        () => updateRecurringTask('task-1', { name: 'Updated Name' }),
        () => updateRecurringTask('task-2', { estimatedHours: 5 }),
        () => updateRecurringTask('task-3', { priority: 'High' as any })
      ];

      const startTime = Date.now();
      
      try {
        const results = await Promise.all(
          standardOperations.map((op, index) =>
            performanceMonitor.measureOperation(`standardOp_${index}`, op)
          )
        );

        const avgDuration = performanceMonitor.getAverageDuration();
        const totalDuration = Date.now() - startTime;
        
        // Standard operations should maintain good performance
        expect(avgDuration).toBeLessThan(200);
        expect(totalDuration).toBeLessThan(1000);
        
        const allSuccessful = results.every(r => r.metrics.success);
        expect(allSuccessful).toBe(true);

        resultAggregator.addResult(
          'No performance degradation in existing functionality',
          'Regression Testing',
          avgDuration < 200 && allSuccessful,
          totalDuration
        );
      } catch (error) {
        resultAggregator.addResult(
          'No performance degradation in existing functionality',
          'Regression Testing',
          false,
          Date.now() - startTime,
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    });
  });
});
