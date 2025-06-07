
/**
 * Phase 5: Integration Testing Utilities
 * 
 * Helper functions and utilities for comprehensive integration testing.
 */

import { MatrixData } from '@/services/forecasting/matrixUtils';

export class IntegrationTestHelpers {
  /**
   * Create mock matrix data for testing
   */
  static createMockMatrixData(options: {
    skillCount?: number;
    monthCount?: number;
    includeData?: boolean;
  } = {}): MatrixData {
    const {
      skillCount = 3,
      monthCount = 12,
      includeData = true
    } = options;

    const skills = Array.from({ length: skillCount }, (_, i) => 
      ['Junior', 'Senior', 'CPA', 'Manager', 'Partner'][i] || `Skill${i + 1}`
    );

    const months = Array.from({ length: monthCount }, (_, i) => {
      const date = new Date(2024, i, 1);
      return {
        key: `2024-${String(i + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
    });

    const dataPoints = includeData 
      ? skills.flatMap(skill =>
          months.map(month => ({
            skill,
            month: month.key,
            demand: Math.floor(Math.random() * 100) + 50,
            capacity: Math.floor(Math.random() * 120) + 60,
            gap: Math.floor(Math.random() * 40) - 20
          }))
        )
      : [];

    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demand, 0);
    const totalCapacity = dataPoints.reduce((sum, dp) => sum + dp.capacity, 0);
    const totalGap = dataPoints.reduce((sum, dp) => sum + dp.gap, 0);

    return {
      skills,
      months,
      dataPoints,
      totalDemand,
      totalCapacity,
      totalGap
    };
  }

  /**
   * Wait for matrix to be fully loaded
   */
  static async waitForMatrixLoad(
    screen: any,
    timeout: number = 10000
  ): Promise<void> {
    const matrixSelectors = [
      /Enhanced 12-Month Capacity Matrix/i,
      /12-Month Capacity Matrix/i,
      /Matrix/i
    ];

    for (const selector of matrixSelectors) {
      try {
        await screen.waitFor(() => {
          expect(screen.getByText(selector)).toBeInTheDocument();
        }, { timeout });
        return;
      } catch (error) {
        // Try next selector
        continue;
      }
    }

    throw new Error('Matrix failed to load within timeout');
  }

  /**
   * Verify matrix data integrity
   */
  static verifyMatrixDataIntegrity(matrixData: MatrixData): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!matrixData.skills || matrixData.skills.length === 0) {
      issues.push('No skills found in matrix data');
    }

    if (!matrixData.months || matrixData.months.length === 0) {
      issues.push('No months found in matrix data');
    }

    if (!matrixData.dataPoints || matrixData.dataPoints.length === 0) {
      issues.push('No data points found in matrix data');
    }

    const expectedDataPoints = matrixData.skills.length * matrixData.months.length;
    if (matrixData.dataPoints.length !== expectedDataPoints) {
      issues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}`);
    }

    // Verify data point structure
    matrixData.dataPoints.forEach((dp, index) => {
      if (!dp.skill || !dp.month || typeof dp.demand !== 'number' || 
          typeof dp.capacity !== 'number' || typeof dp.gap !== 'number') {
        issues.push(`Invalid data point structure at index ${index}`);
      }
    });

    // Verify totals consistency
    const calculatedDemand = matrixData.dataPoints.reduce((sum, dp) => sum + dp.demand, 0);
    const calculatedCapacity = matrixData.dataPoints.reduce((sum, dp) => sum + dp.capacity, 0);
    const calculatedGap = matrixData.dataPoints.reduce((sum, dp) => sum + dp.gap, 0);

    if (Math.abs(calculatedDemand - matrixData.totalDemand) > 0.01) {
      issues.push('Total demand calculation mismatch');
    }

    if (Math.abs(calculatedCapacity - matrixData.totalCapacity) > 0.01) {
      issues.push('Total capacity calculation mismatch');
    }

    if (Math.abs(calculatedGap - matrixData.totalGap) > 0.01) {
      issues.push('Total gap calculation mismatch');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Simulate user interactions for testing
   */
  static async simulateClientSelection(
    user: any,
    screen: any,
    clientNames: string[]
  ): Promise<void> {
    const clientFilter = screen.getByRole('combobox', { name: /client filter/i });
    
    if (!clientFilter) {
      throw new Error('Client filter not found');
    }

    await user.click(clientFilter);

    for (const clientName of clientNames) {
      const clientOption = screen.getByText(clientName);
      await user.click(clientOption);
    }
  }

  /**
   * Measure performance metrics
   */
  static measurePerformance<T>(
    operation: () => T | Promise<T>
  ): Promise<{ result: T; duration: number; memory?: number }> {
    return new Promise(async (resolve) => {
      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const result = await operation();

      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

      resolve({
        result,
        duration: endTime - startTime,
        memory: endMemory - startMemory
      });
    });
  }

  /**
   * Validate accessibility compliance
   */
  static validateAccessibility(container: Element): {
    isAccessible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for proper ARIA labels
    const interactiveElements = container.querySelectorAll(
      'button, input, select, [role="button"], [role="checkbox"], [role="combobox"]'
    );

    interactiveElements.forEach((element, index) => {
      const hasAccessibleName = 
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        element.hasAttribute('title') ||
        element.textContent?.trim();

      if (!hasAccessibleName) {
        issues.push(`Interactive element at index ${index} lacks accessible name`);
      }
    });

    // Check for proper heading structure
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No headings found for screen reader navigation');
    }

    // Check for focus management
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      issues.push('No focusable elements found');
    }

    return {
      isAccessible: issues.length === 0,
      issues
    };
  }
}

// Export performance monitoring utilities
export const PerformanceMonitor = {
  /**
   * Monitor component render performance
   */
  monitorRenderPerformance: (componentName: string) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        console.log(`${componentName} render time: ${duration}ms`);
        return duration;
      }
    };
  },

  /**
   * Monitor memory usage
   */
  getMemoryUsage: () => {
    if ((performance as any).memory) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  /**
   * Create performance benchmark
   */
  benchmark: async (name: string, operation: () => Promise<any>) => {
    const startTime = performance.now();
    const startMemory = PerformanceMonitor.getMemoryUsage();
    
    const result = await operation();
    
    const endTime = performance.now();
    const endMemory = PerformanceMonitor.getMemoryUsage();
    
    const metrics = {
      name,
      duration: endTime - startTime,
      memoryDelta: endMemory && startMemory 
        ? endMemory.used - startMemory.used 
        : null,
      result
    };
    
    console.log('Performance Benchmark:', metrics);
    return metrics;
  }
};
