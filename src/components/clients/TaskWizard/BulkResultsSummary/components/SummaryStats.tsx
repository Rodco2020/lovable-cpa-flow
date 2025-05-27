
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { SummaryStatsProps } from '../types';
import { formatTime } from '../utils';

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  result,
  successRate
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-green-600">
          <CheckCircle className="h-6 w-6" />
          <span>{result.successfulOperations}</span>
        </div>
        <p className="text-sm text-green-600">Successful</p>
        <p className="text-xs text-green-500 mt-1">
          {successRate.toFixed(1)}% success rate
        </p>
      </div>

      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-red-600">
          <AlertTriangle className="h-6 w-6" />
          <span>{result.failedOperations}</span>
        </div>
        <p className="text-sm text-red-600">Failed</p>
        <p className="text-xs text-red-500 mt-1">
          {((result.failedOperations / result.totalOperations) * 100).toFixed(1)}% failure rate
        </p>
      </div>

      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{result.totalOperations}</div>
        <p className="text-sm text-blue-600">Total Operations</p>
        <div className="flex items-center justify-center space-x-1 text-xs text-blue-500 mt-1">
          <Clock className="h-3 w-3" />
          <span>{formatTime(result.processingTime)}</span>
        </div>
      </div>
    </div>
  );
};
