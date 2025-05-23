
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Client } from '@/types/client';

interface ConfirmationStepProps {
  sourceClientName: string;
  targetClient?: Client;
  selectedAdHocTaskIds: Set<string>;
  selectedRecurringTaskIds: Set<string>;
}

/**
 * Third step of the copy client tasks dialog
 * Shows a summary of what will be copied and asks for confirmation
 */
export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  sourceClientName,
  targetClient,
  selectedAdHocTaskIds,
  selectedRecurringTaskIds
}) => {
  return (
    <div className="py-6 space-y-4">
      <p className="text-sm text-gray-500">
        You are about to copy {selectedAdHocTaskIds.size + selectedRecurringTaskIds.size} selected tasks:
      </p>
      <div className="border rounded-md p-4 bg-gray-50">
        <p><strong>From:</strong> {sourceClientName}</p>
        <p><strong>To:</strong> {targetClient?.legalName}</p>
        <div className="mt-2">
          <p><strong>Selected tasks:</strong></p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {selectedAdHocTaskIds.size > 0 && (
              <li>{selectedAdHocTaskIds.size} ad-hoc task(s)</li>
            )}
            {selectedRecurringTaskIds.size > 0 && (
              <li>{selectedRecurringTaskIds.size} recurring task(s)</li>
            )}
          </ul>
        </div>
      </div>
      <Alert variant="warning" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This action will create copies of the selected tasks for the target client. The operation cannot be undone.
        </AlertDescription>
      </Alert>
    </div>
  );
};
