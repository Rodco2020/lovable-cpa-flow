
/**
 * Performance Monitoring Types and Interfaces
 * 
 * Defines the fundamental types used across the performance monitoring system
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  component: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  summary: {
    averageResponseTime: number;
    slowestOperations: PerformanceMetric[];
    fastestOperations: PerformanceMetric[];
    totalOperations: number;
  };
  recommendations: string[];
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  type: 'slow_query' | 'memory_usage' | 'frequent_errors' | 'cache_miss';
  message: string;
  severity: 'low' | 'medium' | 'high';
  component: string;
  suggestion: string;
}

export interface TimingData {
  name: string;
  component: string;
  startTime: number;
  metadata?: Record<string, any>;
}

export interface PerformanceConfig {
  maxMetrics: number;
  slowThreshold: number;
  warningThreshold: number;
}
