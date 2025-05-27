
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PerformanceMetricsProps } from '../types';
import { formatTime } from '../utils';

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  result,
  successRate
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Performance Metrics</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Total Processing Time:</span>
            <span className="font-medium">{formatTime(result.processingTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Time per Operation:</span>
            <span className="font-medium">
              {result.totalOperations > 0 
                ? (result.processingTime / result.totalOperations).toFixed(0) + 'ms'
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Operations per Second:</span>
            <span className="font-medium">
              {result.processingTime > 0 
                ? ((result.totalOperations / result.processingTime) * 1000).toFixed(2)
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Result Breakdown</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tasks Created:</span>
            <span className="font-medium">{result.results.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Operations Failed:</span>
            <span className="font-medium">{result.errors.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Success Rate:</span>
            <Badge variant={successRate >= 95 ? "default" : successRate >= 80 ? "secondary" : "destructive"}>
              {successRate.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
