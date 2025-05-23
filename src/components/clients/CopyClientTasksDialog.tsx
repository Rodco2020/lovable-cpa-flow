
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, ArrowLeft, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

interface CopyClientTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceClientId: string;
  sourceClientName: string;
}

type DialogStep = 'select-client' | 'select-tasks' | 'confirmation';

const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({
  isOpen,
  onClose,
  sourceClientId,
  sourceClientName,
}) => {
  const [step, setStep] = useState<DialogStep>('select-client');
  const [targetClientId, setTargetClientId] = useState<string>('');

  // Fetch all clients for the dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
    enabled: isOpen,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      }
    }
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('select-client');
      setTargetClientId('');
    }
  }, [isOpen]);

  // Filter out the source client from the clients list
  const availableClients = clients?.filter(client => client.id !== sourceClientId) || [];

  const handleNext = () => {
    if (step === 'select-client') {
      if (!targetClientId) {
        toast.error('Please select a target client');
        return;
      }
      setStep('select-tasks');
    } else if (step === 'select-tasks') {
      // In Phase 2, we'll add validation for task selection here
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

  const handleCopy = () => {
    // In Phase 3, we'll implement the actual copying functionality
    toast.success('Tasks copied successfully!');
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select-client':
        return (
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-500">
              Select a client to copy tasks to:
            </p>
            <Select
              value={targetClientId}
              onValueChange={(value) => setTargetClientId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                  <div className="p-2 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading clients...</span>
                  </div>
                ) : availableClients.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">No other clients available</div>
                ) : (
                  availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.legalName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        );
      case 'select-tasks':
        return (
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Select tasks to copy (will be implemented in Phase 2):
            </p>
            <div className="border rounded-md p-4 text-center text-gray-500">
              Task selection UI will be added in Phase 2
            </div>
          </div>
        );
      case 'confirmation':
        const targetClient = availableClients.find(client => client.id === targetClientId);
        return (
          <div className="py-6 space-y-4">
            <p className="text-sm text-gray-500">
              You are about to copy selected tasks from:
            </p>
            <div className="border rounded-md p-4">
              <p><strong>From:</strong> {sourceClientName}</p>
              <p><strong>To:</strong> {targetClient?.legalName}</p>
            </div>
            <p className="text-sm text-amber-600 font-semibold">
              This action will create copies of the selected tasks for the target client.
            </p>
          </div>
        );
    }
  };

  const renderFooter = () => {
    return (
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
        <div>
          {step !== 'select-client' && (
            <Button variant="outline" onClick={handleBack} className="mt-2 sm:mt-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step === 'confirmation' ? (
            <Button onClick={handleCopy}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy Tasks
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Client Tasks</DialogTitle>
          <DialogDescription>
            Copy tasks from {sourceClientName} to another client
          </DialogDescription>
        </DialogHeader>
        {renderStepContent()}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
