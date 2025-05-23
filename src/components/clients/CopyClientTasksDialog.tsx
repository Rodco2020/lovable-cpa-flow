
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { getActiveClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { Loader2 } from 'lucide-react';

interface CopyClientTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceClientId: string;
  sourceClientName: string;
}

/**
 * Dialog component for copying tasks from one client to another.
 * 
 * Phase 1: Basic dialog with client selection
 */
const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({
  isOpen,
  onClose,
  sourceClientId,
  sourceClientName,
}) => {
  // Dialog state
  const [step, setStep] = useState<'select-client' | 'select-tasks' | 'confirmation'>('select-client');
  const [targetClientId, setTargetClientId] = useState<string>('');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('select-client');
      setTargetClientId('');
    }
  }, [isOpen]);

  // Fetch active clients for the dropdown
  const { data: clients, isLoading } = useQuery({
    queryKey: ['active-clients'],
    queryFn: getActiveClients,
    enabled: isOpen,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error("Failed to load clients:", error);
        }
      }
    }
  });

  // Filter out the source client from the list
  const availableClients = clients?.filter(client => client.id !== sourceClientId) || [];

  const handleNext = () => {
    if (step === 'select-client' && targetClientId) {
      setStep('select-tasks');
    } else if (step === 'select-tasks') {
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'select-tasks') {
      setStep('select-client');
    } else if (step === 'confirmation') {
      setStep('select-tasks');
    }
  };

  // Render client selection step
  const renderClientSelectionStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the client you want to copy tasks to:
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : availableClients.length > 0 ? (
        <Select
          value={targetClientId}
          onValueChange={setTargetClientId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {availableClients.map((client: Client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.legalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-center py-4 text-amber-600">
          No other active clients available to copy tasks to.
        </div>
      )}
    </div>
  );

  // Content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 'select-client':
        return renderClientSelectionStep();
      case 'select-tasks':
        // Placeholder for Phase 2
        return <div>Task selection will be implemented in Phase 2</div>;
      case 'confirmation':
        // Placeholder for Phase 2
        return <div>Confirmation will be implemented in Phase 2</div>;
    }
  };

  // Dialog footer buttons
  const renderFooterButtons = () => {
    return (
      <DialogFooter className="flex justify-between sm:justify-between space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex space-x-2">
          {step !== 'select-client' && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={step === 'select-client' && !targetClientId}
          >
            {step === 'confirmation' ? 'Copy Tasks' : 'Next'}
          </Button>
        </div>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Client Tasks</DialogTitle>
          <DialogDescription>
            Copy tasks from {sourceClientName} to another client
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
        
        {renderFooterButtons()}
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
