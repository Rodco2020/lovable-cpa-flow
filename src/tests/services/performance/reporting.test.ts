
/**
 * Performance Report Generator Tests
 */

import { PerformanceReportGenerator } from '@/services/performance/reporting';
import { PerformanceMetric } from '@/services/performance/types';

describe('PerformanceReportGenerator', () => {
  let reportGenerator: PerformanceReportGenerator;
  const config = {
    maxMetrics: 1000,
    slowThreshold: 1000,
    warningThreshold: 500
  };

  beforeEach(() => {
    reportGenerator = new PerformanceReportGenerator(config);
  });

  const createTestMetric = (overrides: Partial<PerformanceMetric> = {}): PerformanceMetric => ({
    id: 'test-id',
    name: 'test-operation',
    duration: 100,
    timestamp: new Date(),
    component: 'TestComponent',
    ...overrides
  });

  it('should generate report with empty metrics', () => {
    const report = reportGenerator.generateReport([]);
    
    expect(report.summary.totalOperations).toBe(0);
    expect(report.summary.averageResponseTime).toBe(0);
    expect(report.recommendations).toContain('No performance data available');
  });

  it('should generate report with metrics', () => {
    const metrics = [
      createTestMetric({ duration: 100 }),
      createTestMetric({ duration: 200 }),
      createTestMetric({ duration: 300 })
    ];
    
    const report = reportGenerator.generateReport(metrics);
    
    expect(report.summary.totalOperations).toBe(3);
    expect(report.summary.averageResponseTime).toBe(200);
    expect(report.summary.slowestOperations[0].duration).toBe(300);
    expect(report.summary.fastestOperations[0].duration).toBe(100);
  });

  it('should filter metrics by timeframe', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    const metrics = [
      createTestMetric({ timestamp: now }),
      createTestMetric({ timestamp: twoHoursAgo })
    ];
    
    const report = reportGenerator.generateReport(metrics, 1); // 1 hour timeframe
    
    expect(report.summary.totalOperations).toBe(1);
  });

  it('should generate recommendations for slow operations', () => {
    const metrics = Array.from({ length: 10 }, (_, i) => 
      createTestMetric({ 
        duration: 600, // Above warning threshold
        name: 'slow-operation',
        component: 'SlowComponent'
      })
    );
    
    const report = reportGenerator.generateReport(metrics);
    
    expect(report.recommendations).toContain(
      expect.stringContaining('Consider optimizing "SlowComponent:slow-operation"')
    );
  });
});
