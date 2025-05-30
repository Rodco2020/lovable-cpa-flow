
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { FormattedTask } from '../types';
import { TaskMetricsService } from '../services/taskMetricsService';
import { EnhancedMetricsService, TrendMetrics } from '../services/enhancedMetricsService';

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
 * MetricsProvider Component
 * 
 * Provides centralized metrics calculation with performance optimization
 * Features:
 * - Memoized calculations to prevent unnecessary recalculations
 * - Loading states for better UX
 * - Error handling for metrics calculations
 * - Centralized metrics state management
 */
export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children, tasks }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized task metrics calculation
  const taskMetrics = useMemo(() => {
    try {
      if (!tasks || tasks.length === 0) return null;
      setIsCalculating(true);
      const metrics = TaskMetricsService.calculateTaskMetrics(tasks);
      setError(null);
      return metrics;
    } catch (err) {
      console.error('Error calculating task metrics:', err);
      setError('Failed to calculate task metrics');
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [tasks]);

  // Memoized trend metrics calculation
  const trendMetrics = useMemo(() => {
    try {
      if (!tasks || tasks.length === 0) return null;
      return EnhancedMetricsService.calculateTrendMetrics(tasks);
    } catch (err) {
      console.error('Error calculating trend metrics:', err);
      setError('Failed to calculate trend metrics');
      return null;
    }
  }, [tasks]);

  // Manual recalculation callback
  const recalculateMetrics = useCallback((newTasks: FormattedTask[]) => {
    setIsCalculating(true);
    setError(null);
    // Force recalculation by triggering a state update
    setTimeout(() => setIsCalculating(false), 100);
  }, []);

  const contextValue = useMemo(() => ({
    taskMetrics,
    trendMetrics,
    isCalculating,
    error,
    recalculateMetrics
  }), [taskMetrics, trendMetrics, isCalculating, error, recalculateMetrics]);

  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
};

// Custom hook to use metrics context
export const useMetricsContext = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetricsContext must be used within a MetricsProvider');
  }
  return context;
};
