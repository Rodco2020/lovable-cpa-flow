
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkResultsSummaryProps } from './types';
import { ResultsHeader } from './components/ResultsHeader';
import { SummaryStats } from './components/SummaryStats';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { SuccessfulOperations } from './components/SuccessfulOperations';
import { FailedOperations } from './components/FailedOperations';
import { calculateSuccessRate } from './utils';

export const BulkResultsSummary: React.FC<BulkResultsSummaryProps> = ({
  result,
  onRetryFailed,
  onExportResults,
  onViewDetails
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const successRate = calculateSuccessRate(result);

  return (
    <Card>
      <ResultsHeader 
        result={result}
        onRetryFailed={onRetryFailed}
        onExportResults={onExportResults || (() => {})}
      />
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="successes">Successes</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <SummaryStats result={result} successRate={successRate} />
            <PerformanceMetrics result={result} successRate={successRate} />
          </TabsContent>

          <TabsContent value="successes" className="space-y-4">
            <SuccessfulOperations result={result} onViewDetails={onViewDetails} />
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <FailedOperations result={result} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
