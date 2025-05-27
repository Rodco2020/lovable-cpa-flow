
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Zap, Target } from 'lucide-react';
import { PerformanceMetricsProps } from '../types';
import { formatTime } from '../utils';

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  result,
  successRate
}) => {
  const averageTimePerOperation = result.totalOperations > 0 
    ? result.processingTime / result.totalOperations 
    : 0;

  const throughputPerSecond = result.processingTime > 0 
    ? (result.totalOperations / (result.processingTime / 1000)).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-lg font-semibold text-green-600">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {throughputPerSecond}
            </div>
            <div className="text-xs text-muted-foreground">Operations/sec</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {formatTime(averageTimePerOperation)}
            </div>
            <div className="text-xs text-muted-foreground">Avg per operation</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Success Rate</span>
            <span>{successRate.toFixed(1)}%</span>
          </div>
          <Progress value={successRate} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
