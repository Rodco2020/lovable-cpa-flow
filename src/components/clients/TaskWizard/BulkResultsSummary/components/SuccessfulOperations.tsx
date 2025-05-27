
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, FileText } from 'lucide-react';
import { SuccessfulOperationsProps } from '../types';

export const SuccessfulOperations: React.FC<SuccessfulOperationsProps> = ({
  result,
  onViewDetails
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
