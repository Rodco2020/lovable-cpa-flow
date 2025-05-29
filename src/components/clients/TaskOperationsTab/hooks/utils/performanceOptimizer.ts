
/**
 * Performance Optimization Utilities - Phase 5
 * 
 * Centralized performance optimizations for the copy tasks workflow:
 * - Memoization helpers
 * - Debounced operations
 * - Memory cleanup utilities
 * - Performance monitoring
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Optimized memoization hook for expensive computations
 */
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  return useMemo(() => {
    const start = performance.now();
    const result = factory();
    const end = performance.now();
    
    if (debugName && end - start > 10) {
      console.warn(`Slow computation in ${debugName}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, deps);
};

/**
 * Debounced callback hook for performance optimization
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, deps) as T;
};

/**
 * Memory cleanup hook for component unmounting
 */
export const useMemoryCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return () => {
      cleanupFn();
    };
  }, [cleanupFn]);
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string, enabled = false) => {
  const renderStart = useRef<number>();
  
  useEffect(() => {
    if (!enabled) return;
    
    renderStart.current = performance.now();
    
    return () => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        if (renderTime > 100) { // Log slow renders
          console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
};

/**
 * Optimized array comparison for dependency arrays
 */
export const areArraysEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};

/**
 * Memory-efficient client filtering
 */
export const createClientFilter = (excludeIds: string[] = [], statusFilter = 'Active') => {
  return (clients: any[]) => {
    if (!Array.isArray(clients)) return [];
    
    return clients.filter(client => 
      !excludeIds.includes(client.id) && 
      client.status === statusFilter
    );
  };
};

/**
 * Batch update helper for multiple state updates
 */
export const createBatchUpdater = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>
) => {
  return (updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  };
};
