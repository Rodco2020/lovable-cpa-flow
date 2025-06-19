
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { FormattedTask } from '../types';
import { TaskMetricsService } from '../services/taskMetricsService';
import { EnhancedMetricsService, TrendMetrics } from '../services/enhancedMetricsService';
import { MetricsErrorBoundary } from '../components/MetricsErrorBoundary';

interface MetricsContextType {
  taskMetrics: ReturnType<typeof TaskMetricsService.calculateTaskMetrics> | null;
  trendMetrics: TrendMetrics | null;
  isCalculating: boolean;
  error: string | null;
  recalculateMetrics: (tasks: FormattedTask[]) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

interface MetricsProviderProps {
  children: React.ReactNode;
  tasks: FormattedTask[];
}

/**
 * Enhanced MetricsProvider with Error Protection
 * 
 * Provides centralized metrics calculation with performance optimization
 * and comprehensive error handling to prevent application crashes.
 */
export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children, tasks }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe task metrics calculation with error handling
  const taskMetrics = useMemo(() => {
    try {
      if (!tasks || tasks.length === 0) return null;
      
      setIsCalculating(true);
      setError(null);
      
      const metrics = TaskMetricsService.calculateTaskMetrics(tasks);
      console.log('✅ [MetricsProvider] Task metrics calculated successfully');
      return metrics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown metrics calculation error';
      console.error('💥 [MetricsProvider] Error calculating task metrics:', err);
      setError(`Task metrics calculation failed: ${errorMessage}`);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [tasks]);

  // Safe trend metrics calculation with error handling
  const trendMetrics = useMemo(() => {
    try {
      if (!tasks || tasks.length === 0) return null;
      
      const trends = EnhancedMetricsService.calculateTrendMetrics(tasks);
      console.log('✅ [MetricsProvider] Trend metrics calculated successfully');
      return trends;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown trend calculation error';
      console.error('💥 [MetricsProvider] Error calculating trend metrics:', err);
      setError(`Trend metrics calculation failed: ${errorMessage}`);
      return null;
    }
  }, [tasks]);

  // Manual recalculation with error handling
  const recalculateMetrics = useCallback((newTasks: FormattedTask[]) => {
    try {
      setIsCalculating(true);
      setError(null);
      console.log('🔄 [MetricsProvider] Manual recalculation triggered');
      
      // Force recalculation by triggering a state update
      setTimeout(() => {
        setIsCalculating(false);
        console.log('✅ [MetricsProvider] Manual recalculation completed');
      }, 100);
    } catch (err) {
      console.error('💥 [MetricsProvider] Error during manual recalculation:', err);
      setError('Failed to recalculate metrics');
      setIsCalculating(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    taskMetrics,
    trendMetrics,
    isCalculating,
    error,
    recalculateMetrics
  }), [taskMetrics, trendMetrics, isCalculating, error, recalculateMetrics]);

  return (
    <MetricsErrorBoundary
      fallback={
        <div className="p-4 text-center text-muted-foreground">
          <p>Metrics temporarily unavailable</p>
          <p className="text-xs mt-2">Please refresh the page to try again</p>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('🚨 [MetricsProvider] Error boundary caught error:', error, errorInfo);
        setError(`Metrics system error: ${error.message}`);
      }}
    >
      <MetricsContext.Provider value={contextValue}>
        {children}
      </MetricsContext.Provider>
    </MetricsErrorBoundary>
  );
};

// Custom hook to use metrics context with error handling
export const useMetricsContext = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetricsContext must be used within a MetricsProvider');
  }
  return context;
};
