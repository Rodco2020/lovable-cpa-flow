
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  BarChart3, 
  Download, 
  RefreshCw,
  FileText,
  Clock
} from 'lucide-react';
import { BulkOperationResult } from './types';

interface BulkResultsSummaryProps {
  result: BulkOperationResult;
  onRetryFailed?: () => void;
  onExportResults?: () => void;
  onViewDetails?: (resultId: string) => void;
}

export const BulkResultsSummary: React.FC<BulkResultsSummaryProps> = ({
  result,
  onRetryFailed,
  onExportResults,
  onViewDetails
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  const successRate = result.totalOperations > 0 
    ? (result.successfulOperations / result.totalOperations) * 100 
    : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const downloadResults = () => {
    const csvData = [
      ['Operation', 'Status', 'Client ID', 'Template ID', 'Error Message'],
      ...result.results.map((r, index) => [
        `Operation ${index + 1}`,
        'Success',
        r.client_id || '',
        r.template_id || '',
        ''
      ]),
      ...result.errors.map((error, index) => [
        `Error ${index + 1}`,
        'Failed',
        error.clientId || '',
        error.templateId || '',
        error.error
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-operation-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Operation Results</span>
          </CardTitle>
          <div className="flex space-x-2">
            {result.failedOperations > 0 && onRetryFailed && (
              <Button variant="outline" size="sm" onClick={onRetryFailed}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Failed
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={downloadResults}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="successes">Successes</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Overall Statistics */}
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

            {/* Performance Metrics */}
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
          </TabsContent>

          <TabsContent value="successes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Successful Operations ({result.successfulOperations})</h4>
              <Badge variant="default">{result.successfulOperations} tasks created</Badge>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {result.results.map((taskResult, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">{taskResult.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Client: {taskResult.client_id} | Template: {taskResult.template_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{taskResult.status}</Badge>
                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(taskResult.id)}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Failed Operations ({result.failedOperations})</h4>
              <Badge variant="destructive">{result.errors.length} errors</Badge>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {result.errors.map((error, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-800">
                          Operation {index + 1} Failed
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          {error.clientId && <span>Client: {error.clientId} | </span>}
                          {error.templateId && <span>Template: {error.templateId}</span>}
                        </div>
                        <div className="text-sm text-red-700 mt-2 p-2 bg-red-100 rounded">
                          {error.error}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {result.errors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No errors recorded
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
