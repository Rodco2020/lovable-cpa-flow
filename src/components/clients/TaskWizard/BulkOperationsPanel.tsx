
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { BulkOperationConfig, BulkOperationResult, ProgressUpdate } from './types';
import { ConfigurationTab } from './BulkOperationsPanel/ConfigurationTab';
import { OperationSummary } from './BulkOperationsPanel/OperationSummary';
import { ControlButtons } from './BulkOperationsPanel/ControlButtons';
import { ProgressTab } from './BulkOperationsPanel/ProgressTab';
import { ResultsTab } from './BulkOperationsPanel/ResultsTab';
import { useBulkOperationsConfig } from './BulkOperationsPanel/hooks/useBulkOperationsConfig';
import { useBulkOperationsState } from './BulkOperationsPanel/hooks/useBulkOperationsState';

interface BulkOperationsPanelProps {
  selectedClientCount: number;
  selectedTemplateCount: number;
  config: BulkOperationConfig;
  onConfigChange: (config: BulkOperationConfig) => void;
  onStartOperation: () => void;
  onPauseOperation: () => void;
  onStopOperation: () => void;
  isRunning: boolean;
  isPaused: boolean;
  progress?: ProgressUpdate;
  result?: BulkOperationResult;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedClientCount,
  selectedTemplateCount,
  config,
  onConfigChange,
  onStartOperation,
  onPauseOperation,
  onStopOperation,
  isRunning,
  isPaused,
  progress,
  result
}) => {
  const [activeTab, setActiveTab] = useState('config');
  
  const { updateConfig } = useBulkOperationsConfig(config, onConfigChange);
  const { canStart } = useBulkOperationsState(selectedClientCount, selectedTemplateCount, isRunning);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Bulk Operations Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <ConfigurationTab 
              config={config}
              onConfigChange={onConfigChange}
            />

            <OperationSummary
              selectedClientCount={selectedClientCount}
              selectedTemplateCount={selectedTemplateCount}
            />

            <ControlButtons
              canStart={canStart}
              isRunning={isRunning}
              isPaused={isPaused}
              onStartOperation={onStartOperation}
              onPauseOperation={onPauseOperation}
              onStopOperation={onStopOperation}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <ProgressTab
              progress={progress}
              isRunning={isRunning}
              isPaused={isPaused}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <ResultsTab result={result} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
