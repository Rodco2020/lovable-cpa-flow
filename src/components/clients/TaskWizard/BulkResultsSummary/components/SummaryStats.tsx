
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { SummaryStatsProps } from '../types';
import { formatTime } from '../utils';

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  result,
  successRate
}) => {
  const failureRate = 100 - successRate;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Successful</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {result.successfulOperations}
          </div>
          <div className="text-sm text-muted-foreground">
            {successRate.toFixed(1)}% success rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Failed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {result.failedOperations}
          </div>
          <div className="text-sm text-muted-foreground">
            {failureRate.toFixed(1)}% failure rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Total</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {result.totalOperations}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatTime(result.processingTime)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
