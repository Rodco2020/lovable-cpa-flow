import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { StaffOption } from '@/types/staffOption';

/**
 * Integration Test Helpers
 * Utilities for comprehensive end-to-end testing of the preferred staff feature
 */

export interface TestScenario {
  name: string;
  description: string;
  initialTask: Partial<RecurringTask>;
  updates: Partial<RecurringTask>;
  expectedResult: Partial<RecurringTask>;
}

export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * Create comprehensive test scenarios for preferred staff functionality
 */
export const createPreferredStaffTestScenarios = (): TestScenario[] => [
  {
    name: 'Add preferred staff to task without staff',
    description: 'Test adding preferred staff to a task that previously had none',
    initialTask: {
      name: 'Task Without Staff',
      preferredStaffId: null
    },
    updates: {
      preferredStaffId: 'staff-123'
    },
    expectedResult: {
      name: 'Task Without Staff',
      preferredStaffId: 'staff-123'
    }
  },
  {
    name: 'Change preferred staff assignment',
    description: 'Test changing from one staff member to another',
    initialTask: {
      name: 'Task With Staff',
      preferredStaffId: 'staff-123'
    },
    updates: {
      preferredStaffId: 'staff-456'
    },
    expectedResult: {
      name: 'Task With Staff',
      preferredStaffId: 'staff-456'
    }
  },
  {
    name: 'Remove preferred staff assignment',
    description: 'Test removing preferred staff assignment',
    initialTask: {
      name: 'Task With Staff',
      preferredStaffId: 'staff-123'
    },
    updates: {
      preferredStaffId: null
    },
    expectedResult: {
      name: 'Task With Staff',
      preferredStaffId: null
    }
  },
  {
    name: 'Update task with preferred staff and other fields',
    description: 'Test updating multiple fields including preferred staff',
    initialTask: {
      name: 'Original Task',
      estimatedHours: 2,
      priority: 'Medium' as TaskPriority,
      preferredStaffId: null
    },
    updates: {
      name: 'Updated Task',
      estimatedHours: 4,
      priority: 'High' as TaskPriority,
      preferredStaffId: 'staff-789'
    },
    expectedResult: {
      name: 'Updated Task',
      estimatedHours: 4,
      priority: 'High' as TaskPriority,
      preferredStaffId: 'staff-789'
    }
  }
];

/**
 * Generate mock staff options for testing various scenarios
 */
export const generateMockStaffOptions = (count: number): StaffOption[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `staff-${i + 1}`,
    full_name: `Staff Member ${i + 1}`
  }));
};

/**
 * Create mock recurring task with all required fields
 */
export const createCompleteRecurringTask = (overrides: Partial<RecurringTask> = {}): RecurringTask => {
  return {
    id: 'test-task-1',
    templateId: 'template-1',
    clientId: 'client-1',
    name: 'Test Recurring Task',
    description: 'Test task description',
    estimatedHours: 2,
    requiredSkills: ['CPA'],
    priority: 'Medium' as TaskPriority,
    category: 'Advisory' as TaskCategory,
    status: 'Unscheduled',
    dueDate: new Date('2023-06-15'),
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2023-05-01'),
    recurrencePattern: {
      type: 'Monthly',
      interval: 1,
      dayOfMonth: 15
    },
    lastGeneratedDate: null,
    isActive: true,
    preferredStaffId: null,
    ...overrides
  };
};

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  async measureOperation<T>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      
      const metrics: PerformanceMetrics = {
        operationName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true
      };
      
      this.metrics.push(metrics);
      return { result, metrics };
    } catch (error) {
      const endTime = performance.now();
      
      const metrics: PerformanceMetrics = {
        operationName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.metrics.push(metrics);
      throw error;
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageDuration(operationName?: string): number {
    const filtered = operationName 
      ? this.metrics.filter(m => m.operationName === operationName)
      : this.metrics;
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  reset(): void {
    this.metrics = [];
  }
}

/**
 * Data integrity validator
 */
export class DataIntegrityValidator {
  /**
   * Validate that preferred staff ID follows correct format
   */
  static validatePreferredStaffId(staffId: string | null): boolean {
    if (staffId === null) return true;
    
    // Check UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(staffId);
  }

  /**
   * Validate that task data maintains integrity after operations
   */
  static validateTaskIntegrity(
    originalTask: RecurringTask, 
    updatedTask: RecurringTask, 
    expectedChanges: Partial<RecurringTask>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check that unchanged fields remain the same
    const unchangedFields = ['id', 'templateId', 'clientId', 'createdAt'] as const;
    
    for (const field of unchangedFields) {
      if (originalTask[field] !== updatedTask[field]) {
        errors.push(`Field ${field} should not have changed`);
      }
    }

    // Check that expected changes were applied
    for (const [key, expectedValue] of Object.entries(expectedChanges)) {
      const actualValue = updatedTask[key as keyof RecurringTask];
      if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
        errors.push(`Field ${key} was not updated correctly. Expected: ${JSON.stringify(expectedValue)}, Got: ${JSON.stringify(actualValue)}`);
      }
    }

    // Validate preferred staff ID format if present
    if (updatedTask.preferredStaffId !== null && !this.validatePreferredStaffId(updatedTask.preferredStaffId)) {
      errors.push('Preferred staff ID has invalid format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Error simulation utilities for testing error scenarios
 */
export class ErrorSimulator {
  /**
   * Simulate database connection error
   */
  static createDatabaseError(): Error {
    return new Error('Database connection failed');
  }

  /**
   * Simulate network timeout error
   */
  static createNetworkError(): Error {
    return new Error('Network request timed out');
  }

  /**
   * Simulate invalid data error
   */
  static createValidationError(field: string): Error {
    return new Error(`Validation failed for field: ${field}`);
  }

  /**
   * Simulate staff not found error
   */
  static createStaffNotFoundError(staffId: string): Error {
    return new Error(`Staff member with ID ${staffId} not found`);
  }
}

/**
 * Test result aggregator for comprehensive reporting
 */
export class TestResultAggregator {
  private results: Array<{
    testName: string;
    category: string;
    passed: boolean;
    duration: number;
    error?: string;
  }> = [];

  addResult(testName: string, category: string, passed: boolean, duration: number, error?: string): void {
    this.results.push({
      testName,
      category,
      passed,
      duration,
      error
    });
  }

  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    averageDuration: number;
    categories: Record<string, { passed: number; total: number }>;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const averageDuration = total > 0 
      ? this.results.reduce((sum, r) => sum + r.duration, 0) / total 
      : 0;

    // Group by category
    const categories: Record<string, { passed: number; total: number }> = {};
    for (const result of this.results) {
      if (!categories[result.category]) {
        categories[result.category] = { passed: 0, total: 0 };
      }
      categories[result.category].total++;
      if (result.passed) {
        categories[result.category].passed++;
      }
    }

    return {
      total,
      passed,
      failed,
      passRate,
      averageDuration,
      categories
    };
  }

  getFailedTests(): Array<{ testName: string; category: string; error: string }> {
    return this.results
      .filter(r => !r.passed)
      .map(r => ({
        testName: r.testName,
        category: r.category,
        error: r.error || 'Unknown error'
      }));
  }

  reset(): void {
    this.results = [];
  }
}
