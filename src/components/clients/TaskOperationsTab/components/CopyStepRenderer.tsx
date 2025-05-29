
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/types/client';
import { StepRenderer } from './stepRenderer/StepRenderer';

interface CopyStepRendererProps {
  currentStep: string;
  initialClientId: string;
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  availableClients: Client[];
  isClientsLoading: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  canGoNext: boolean;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
  onSelectSourceClient: (clientId: string) => void;
  onSelectTargetClient: (clientId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onExecuteCopy: () => Promise<void>;
  onReset: () => void;
  onClose?: () => void;
}

/**
 * CopyStepRenderer Component
 * 
 * Handles the rendering of different steps in the copy tasks workflow.
 * This component has been refactored to improve maintainability by:
 * - Extracting individual step components into focused, reusable modules
 * - Centralizing step rendering logic in a dedicated StepRenderer component
 * - Maintaining exact same functionality and UI behavior as before
 * 
 * Workflow Steps:
 * 1. select-source-client: Choose which client to copy tasks from
 * 2. selection: Choose which client to copy tasks to
 * 3. task-selection: Select specific tasks to copy
 * 4. confirmation: Review and confirm the copy operation
 * 5. processing: Execute the copy with progress tracking
 * 6. complete: Show results and cleanup options
 */
export const CopyStepRenderer: React.FC<CopyStepRendererProps> = (props) => {
  return (
    <Card>
      <CardContent className="p-6">
        <StepRenderer {...props} />
      </CardContent>
    </Card>
  );
};
