
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BulkOperationConfig, BulkOperationResult, ProgressUpdate } from './types';

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

  const updateConfig = (updates: Partial<BulkOperationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const totalOperations = selectedClientCount * selectedTemplateCount;
  const canStart = totalOperations > 0 && !isRunning;

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Operation Type</Label>
                <Select
                  value={config.operationType}
                  onValueChange={(value: any) => updateConfig({ operationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template-assignment">Template Assignment</SelectItem>
                    <SelectItem value="task-copy">Task Copy</SelectItem>
                    <SelectItem value="batch-update">Batch Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Batch Size</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={config.batchSize}
                  onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) || 10 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Concurrency</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={config.concurrency}
                  onChange={(e) => updateConfig({ concurrency: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>

            {/* Operation Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold">
                  <Users className="h-6 w-6" />
                  <span>{selectedClientCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Clients</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold">
                  <FileText className="h-6 w-6" />
                  <span>{selectedTemplateCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Templates</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalOperations}</div>
                <p className="text-sm text-muted-foreground">Total Operations</p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={onStartOperation}
                disabled={!canStart}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Operations
              </Button>
              
              {isRunning && (
                <>
                  <Button
                    variant="outline"
                    onClick={isPaused ? onStartOperation : onPauseOperation}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onStopOperation}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {progress ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {progress.completed} / {progress.total}</span>
                    <span>{progress.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress.percentage} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Current: {progress.currentOperation}</span>
                  </div>
                  {progress.estimatedTimeRemaining && (
                    <div className="text-sm text-muted-foreground">
                      Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 1000)}s
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {isPaused ? (
                    <Badge variant="secondary">Paused</Badge>
                  ) : isRunning ? (
                    <Badge variant="default">Running</Badge>
                  ) : (
                    <Badge variant="outline">Stopped</Badge>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No operation in progress
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {result ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      <span>{result.successfulOperations}</span>
                    </div>
                    <p className="text-sm text-green-600">Successful</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-red-600">
                      <AlertTriangle className="h-6 w-6" />
                      <span>{result.failedOperations}</span>
                    </div>
                    <p className="text-sm text-red-600">Failed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.totalOperations}</div>
                    <p className="text-sm text-blue-600">Total</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Processing time: {(result.processingTime / 1000).toFixed(1)}s
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                          {error.clientId && <span className="font-medium">Client {error.clientId}: </span>}
                          {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No results available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
