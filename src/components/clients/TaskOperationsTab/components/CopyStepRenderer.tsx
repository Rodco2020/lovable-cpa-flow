
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
 * Enhanced to work with the integrated copy dialog system.
 * This component has been updated to:
 * - Work seamlessly with the refactored useCopyTasksDialog hook
 * - Maintain exact same functionality and UI behavior as before
 * - Support proper state synchronization between tab and dialog systems
 * - Handle all 6-step workflow progression: select-source-client → selection → task-selection → confirmation → processing → complete
 * 
 * Integration Features:
 * - Delegates all state management to the central copy dialog hook
 * - Maintains backward compatibility with existing interfaces
 * - Supports proper error handling and validation
 * - Ensures consistent step progression and navigation
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
