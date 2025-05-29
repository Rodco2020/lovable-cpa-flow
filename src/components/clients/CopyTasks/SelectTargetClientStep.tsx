
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, CheckCircle } from 'lucide-react';
import { Client } from '@/types/client';
import { PerformanceOptimizedClientList } from './components/PerformanceOptimizedClientList';
import { HelpTooltip } from './components/HelpTooltip';
import { ValidationMessagePanel } from './components/ValidationMessagePanel';
import { EnhancedLoadingState } from './components/EnhancedLoadingState';

interface SelectTargetClientStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  onSelectClient: (clientId: string) => void;
  availableClients: Client[];
  isLoading: boolean;
  sourceClientName?: string;
  validationErrors?: string[];
}

export const SelectTargetClientStep: React.FC<SelectTargetClientStepProps> = ({
  sourceClientId,
  targetClientId,
  onSelectClient,
  availableClients,
  isLoading,
  sourceClientName,
  validationErrors = []
}) => {
  const hasTargetSelected = targetClientId && targetClientId !== sourceClientId;
  const validationMessages = validationErrors.map(error => ({
    type: 'error' as const,
    message: error,
    field: 'Target Client'
  }));

  if (isLoading) {
    return <EnhancedLoadingState type="clients" message="Loading available target clients..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Select Target Client</span>
              <Badge variant="default" className="ml-2 bg-blue-500 text-white">TO</Badge>
              <HelpTooltip 
                content="Choose the client who will receive the copied tasks. The source client is automatically excluded from this list."
                type="info"
              />
            </div>
            {hasTargetSelected && (
              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the client who will receive the copied tasks from{' '}
            {sourceClientName && <strong>{sourceClientName}</strong>}.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validation Messages */}
          <ValidationMessagePanel messages={validationMessages} />

          {/* Context Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 text-sm">
                Tasks will be copied <strong>TO</strong> the client you select here from your source client.
              </span>
            </div>
          </div>

          {/* Performance Optimized Client List */}
          <PerformanceOptimizedClientList
            clients={availableClients}
            selectedClientId={targetClientId || undefined}
            onSelectClient={onSelectClient}
            excludeClientId={sourceClientId}
            maxHeight={400}
          />

          {/* Selection Summary */}
          {hasTargetSelected && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Selected Target Client: {
                    availableClients.find(c => c.id === targetClientId)?.legalName
                  }
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Tasks will be copied TO this client from your selected source client.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
