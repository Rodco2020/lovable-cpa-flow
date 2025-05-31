
import { debugLog } from '../logger';

/**
 * Test utilities for matrix testing
 */
export class TestUtils {
  /**
   * Execute a test function and capture timing
   */
  static async executeTest(
    testName: string,
    testFunction: () => Promise<any>
  ): Promise<{ testName: string; passed: boolean; duration: number; error?: string; details?: any }> {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      return {
        testName,
        passed: true,
        duration: Date.now() - startTime,
        details: result
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get memory usage (fallback for browser compatibility)
   */
  static getMemoryUsage(): number {
    // In browsers, we can't get actual memory usage, so we return 0
    if (typeof window !== 'undefined') {
      return 0; // Browser environment
    }
    
    // Node.js environment would have process.memoryUsage()
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    return 0;
  }

  /**
   * Validate array of items against expected structure
   */
  static validateArrayStructure<T>(
    items: T[],
    validator: (item: T) => boolean,
    itemName: string
  ): string[] {
    const invalidItems = items.filter(item => !validator(item));
    return invalidItems.length > 0 
      ? [`${invalidItems.length} ${itemName} have invalid structure`]
      : [];
  }

  /**
   * Check if values are within expected ranges
   */
  static validateValueRanges<T>(
    items: T[],
    checker: (item: T) => boolean,
    errorMessage: string
  ): string[] {
    const invalidItems = items.filter(item => !checker(item));
    return invalidItems.length > 0 ? [errorMessage.replace('{count}', invalidItems.length.toString())] : [];
  }

  /**
   * Log test results summary
   */
  static logTestSummary(results: any[], testType: string): void {
    const passedTests = results.filter(r => r.passed).length;
    debugLog(`${testType} tests completed: ${passedTests}/${results.length} passed`);
  }
}
