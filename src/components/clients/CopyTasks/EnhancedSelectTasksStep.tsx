
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { SelectTasksStepEnhanced } from './SelectTasksStepEnhanced';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedSelectTasksStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  isTemplateBuilder?: boolean;
}

export const EnhancedSelectTasksStep: React.FC<EnhancedSelectTasksStepProps> = ({
  sourceClientId,
  targetClientId,
  selectedTaskIds,
  setSelectedTaskIds,
  isTemplateBuilder = false,
}) => {
  // Get client names for display
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  const getClientName = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.legalName || 'Unknown Client';
  };

  const sourceClientName = getClientName(sourceClientId);
  const targetClientName = targetClientId ? getClientName(targetClientId) : '';

  return (
    <div className="space-y-6">
      {/* Context Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Copy className="h-5 w-5 text-blue-600" />
              <span>Select Tasks to Copy</span>
              {selectedTaskIds.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedTaskIds.length} selected
                </Badge>
              )}
            </div>
          </CardTitle>
          
          {/* Copy Direction Indicator */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                FROM
              </Badge>
              <span className="font-medium text-gray-700">{sourceClientName}</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400" />
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                TO
              </Badge>
              <span className="font-medium text-gray-700">
                {targetClientName || 'Target Client'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Guidance Alert */}
      <Alert className="bg-green-50 border-green-200">
        <Copy className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <strong>Task Selection:</strong> Choose which tasks from{' '}
          <strong>{sourceClientName}</strong> you want to copy to{' '}
          <strong>{targetClientName}</strong>. You can use filters and search to find specific tasks.
        </AlertDescription>
      </Alert>

      {/* Enhanced Task Selection */}
      <SelectTasksStepEnhanced
        clientId={sourceClientId}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        sourceClientName={sourceClientName}
      />

      {/* Selection Summary */}
      {selectedTaskIds.length > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Copy className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">
                  Ready to copy {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                From {sourceClientName} → {targetClientName}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
