
/**
 * Performance Alert Manager Tests
 */

import { PerformanceAlertManager } from '@/services/performance/alerts';
import { PerformanceMetric } from '@/services/performance/types';

// Mock the error logging service
jest.mock('@/services/errorLoggingService', () => ({
  logError: jest.fn()
}));

describe('PerformanceAlertManager', () => {
  let alertManager: PerformanceAlertManager;
  const config = {
    maxMetrics: 1000,
    slowThreshold: 1000,
    warningThreshold: 500
  };

  beforeEach(() => {
    alertManager = new PerformanceAlertManager(config);
    jest.clearAllMocks();
  });

  const createTestMetric = (overrides: Partial<PerformanceMetric> = {}): PerformanceMetric => ({
    id: 'test-id',
    name: 'test-operation',
    duration: 100,
    timestamp: new Date(),
    component: 'TestComponent',
    ...overrides
  });

  it('should handle slow operations', () => {
    const slowMetric = createTestMetric({ duration: 1500 });
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    alertManager.handleSlowOperation(slowMetric);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Performance Alert:',
      expect.objectContaining({
        type: 'slow_query',
        severity: 'medium'
      })
    );
    
    consoleSpy.mockRestore();
  });

  it('should not alert for fast operations', () => {
    const fastMetric = createTestMetric({ duration: 100 });
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    alertManager.handleSlowOperation(fastMetric);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should generate alerts for high percentage of slow operations', () => {
    const metrics = [
      createTestMetric({ duration: 1500 }), // slow
      createTestMetric({ duration: 1200 }), // slow
      createTestMetric({ duration: 100 }),   // fast
      createTestMetric({ duration: 200 })    // fast
    ];
    
    const alerts = alertManager.generateAlerts(metrics);
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('slow_query');
    expect(alerts[0].message).toContain('50.0%');
  });

  it('should not generate alerts for low percentage of slow operations', () => {
    const metrics = [
      createTestMetric({ duration: 1500 }), // slow
      createTestMetric({ duration: 100 }),   // fast
      createTestMetric({ duration: 200 }),   // fast
      createTestMetric({ duration: 300 })    // fast
    ];
    
    const alerts = alertManager.generateAlerts(metrics);
    
    expect(alerts).toHaveLength(0);
  });
});
