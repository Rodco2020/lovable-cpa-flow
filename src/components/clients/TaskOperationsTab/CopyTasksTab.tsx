
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { EnhancedStepIndicator } from './components/EnhancedStepIndicator';
import { CopyStepRenderer } from './components/CopyStepRenderer';
import { useCopyTabController } from './hooks/useCopyTabController';

interface CopyTasksTabProps {
  initialClientId?: string;
  onClose?: () => void;
  onTasksRefresh?: () => void;
}

/**
 * Copy Tasks Tab Component
 * 
 * Provides a workflow for copying tasks between clients with the following steps:
 * 1. Selection - Choose target client
 * 2. Task Selection - Select which tasks to copy
 * 3. Confirmation - Review and confirm the operation
 * 4. Processing - Execute the copy operation with progress tracking
 * 5. Complete - Show results and cleanup
 * 
 * Features:
 * - Enhanced progress tracking with detailed status messages
 * - Client filtering (excludes source client, only active clients)
 * - Task refresh triggering after successful operations
 * - Error handling and validation
 * - Step-by-step wizard interface with visual progress indicators
 * - Dynamic source client context display
 */
export const CopyTasksTab: React.FC<CopyTasksTabProps> = ({ 
  initialClientId = '',
  onClose, 
  onTasksRefresh 
}) => {
  const {
    // Step management
    copySteps,
    currentStep,
    
    // State management
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    availableClients,
    isClientsLoading,
    
    // Progress management
    isProcessing,
    isSuccess,
    
    // Event handlers
    onSelectClient,
    onBack,
    onNext,
    onExecuteCopy,
    onReset,
    
    // Utility functions
    canGoNext,
    getSourceClientName,
    getTargetClientName
  } = useCopyTabController(initialClientId, onClose, onTasksRefresh);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Copy className="h-5 w-5" />
          <span>Copy Tasks Between Clients</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Copy tasks from one client to another with a guided step-by-step process.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <EnhancedStepIndicator 
            currentStep={currentStep}
            steps={copySteps.map(step => ({
              key: step.key,
              label: step.label,
              icon: Copy, // Will be overridden in the component
              description: ''
            }))}
            sourceClientName={getSourceClientName()}
            targetClientName={getTargetClientName()}
          />

          <CopyStepRenderer
            currentStep={currentStep}
            initialClientId={initialClientId}
            targetClientId={targetClientId}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            availableClients={availableClients}
            isClientsLoading={isClientsLoading}
            isProcessing={isProcessing}
            isSuccess={isSuccess}
            canGoNext={canGoNext()}
            getSourceClientName={getSourceClientName}
            getTargetClientName={getTargetClientName}
            onSelectClient={onSelectClient}
            onBack={onBack}
            onNext={onNext}
            onExecuteCopy={onExecuteCopy}
            onReset={onReset}
            onClose={onClose}
          />
        </div>
      </CardContent>
    </Card>
  );
};
