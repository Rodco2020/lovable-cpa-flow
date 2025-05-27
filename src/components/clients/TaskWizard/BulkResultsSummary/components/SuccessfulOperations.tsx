
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Eye } from 'lucide-react';
import { SuccessfulOperationsProps } from '../types';

export const SuccessfulOperations: React.FC<SuccessfulOperationsProps> = ({
  result,
  onViewDetails
}) => {
  if (result.successfulOperations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Successful Operations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No successful operations to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Successful Operations ({result.successfulOperations})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {result.results.map((operation, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Success
                  </Badge>
                  <span className="text-sm font-medium">
                    Operation {index + 1}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Client: {operation.client_id || 'Unknown'} • 
                  Template: {operation.template_id || 'Unknown'}
                </div>
              </div>
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(operation.id || `${index}`)}
                  className="ml-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
