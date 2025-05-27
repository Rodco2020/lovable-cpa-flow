
/**
 * Performance Metrics Manager Tests
 */

import { PerformanceMetricsManager } from '@/services/performance/metrics';
import { PerformanceMetric } from '@/services/performance/types';

describe('PerformanceMetricsManager', () => {
  let metricsManager: PerformanceMetricsManager;

  beforeEach(() => {
    metricsManager = new PerformanceMetricsManager({ maxMetrics: 5 });
  });

  const createTestMetric = (overrides: Partial<PerformanceMetric> = {}): PerformanceMetric => ({
    id: 'test-id',
    name: 'test-operation',
    duration: 100,
    timestamp: new Date(),
    component: 'TestComponent',
    ...overrides
  });

  it('should record metrics', () => {
    const metric = createTestMetric();
    metricsManager.recordMetric(metric);
    
    expect(metricsManager.getMetricsCount()).toBe(1);
    expect(metricsManager.getAllMetrics()[0]).toEqual(metric);
  });

  it('should enforce max metrics limit', () => {
    // Add 6 metrics when max is 5
    for (let i = 0; i < 6; i++) {
      metricsManager.recordMetric(createTestMetric({ id: `test-${i}` }));
    }
    
    expect(metricsManager.getMetricsCount()).toBe(5);
  });

  it('should get component metrics', () => {
    metricsManager.recordMetric(createTestMetric({ component: 'ComponentA' }));
    metricsManager.recordMetric(createTestMetric({ component: 'ComponentB' }));
    metricsManager.recordMetric(createTestMetric({ component: 'ComponentA' }));
    
    const componentAMetrics = metricsManager.getComponentMetrics('ComponentA');
    expect(componentAMetrics).toHaveLength(2);
    expect(componentAMetrics.every(m => m.component === 'ComponentA')).toBe(true);
  });

  it('should get slowest operations', () => {
    metricsManager.recordMetric(createTestMetric({ duration: 100 }));
    metricsManager.recordMetric(createTestMetric({ duration: 300 }));
    metricsManager.recordMetric(createTestMetric({ duration: 200 }));
    
    const slowest = metricsManager.getSlowestOperations(2);
    expect(slowest).toHaveLength(2);
    expect(slowest[0].duration).toBe(300);
    expect(slowest[1].duration).toBe(200);
  });

  it('should filter metrics by timeframe', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    metricsManager.recordMetric(createTestMetric({ timestamp: now }));
    metricsManager.recordMetric(createTestMetric({ timestamp: twoHoursAgo }));
    
    const recentMetrics = metricsManager.getMetricsInTimeframe(1);
    expect(recentMetrics).toHaveLength(1);
  });

  it('should export metrics as JSON', () => {
    const metric = createTestMetric();
    metricsManager.recordMetric(metric);
    
    const exported = metricsManager.exportMetrics('json');
    const parsed = JSON.parse(exported);
    
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(metric.id);
  });

  it('should export metrics as CSV', () => {
    const metric = createTestMetric();
    metricsManager.recordMetric(metric);
    
    const exported = metricsManager.exportMetrics('csv');
    const lines = exported.split('\n');
    
    expect(lines[0]).toContain('timestamp,component,name,duration,metadata');
    expect(lines[1]).toContain('TestComponent');
  });
});
