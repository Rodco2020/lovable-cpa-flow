
import React from 'react';

interface PerformanceMonitoringSectionProps {
  getPerformanceRating: () => string;
  getOptimizationSuggestions: () => string[];
  tasksCount: number;
}

/**
 * PerformanceMonitoringSection Component
 * 
 * Displays performance monitoring information in development mode only.
 * Shows performance rating, task count, and optimization suggestions.
 */
export const PerformanceMonitoringSection: React.FC<PerformanceMonitoringSectionProps> = ({
  getPerformanceRating,
  getOptimizationSuggestions,
  tasksCount
}) => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const optimizationSuggestions = getOptimizationSuggestions();

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
      <div className="flex items-center justify-between">
        <span>Performance Rating: {getPerformanceRating()}</span>
        <span>Tasks: {tasksCount}</span>
      </div>
      {optimizationSuggestions.length > 0 && (
        <div className="mt-2">
          <strong>Optimization Suggestions:</strong>
          <ul className="list-disc list-inside">
            {optimizationSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
