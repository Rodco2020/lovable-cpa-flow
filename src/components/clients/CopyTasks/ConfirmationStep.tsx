
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, Copy } from 'lucide-react';
import { CopyTaskStep } from './types';

interface ConfirmationStepProps {
  sourceClientId: string;
  targetClientId: string;
  sourceClientName: string;
  targetClientName: string;
  selectedAdHocTaskCount: number;
  selectedRecurringTaskCount: number;
  selectedCount: number;
  step: CopyTaskStep;
  handleBack: () => void;
  handleCopy: () => Promise<void>;
  isProcessing: boolean;
}

/**
 * Third step of the copy client tasks dialog
 * Shows confirmation details before copying
 */
export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  sourceClientName,
  targetClientName,
  selectedAdHocTaskCount,
  selectedRecurringTaskCount,
  selectedCount,
  step,
  handleBack,
  handleCopy,
  isProcessing
}) => {
  const totalTaskCount = selectedCount || (selectedAdHocTaskCount + selectedRecurringTaskCount);
  
  return (
    <div className="py-4 space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        You are about to copy {totalTaskCount} task{totalTaskCount !== 1 ? 's' : ''} from <strong>{sourceClientName}</strong> to <strong>{targetClientName}</strong>.
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>
            {selectedAdHocTaskCount} ad-hoc task{selectedAdHocTaskCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>
            {selectedRecurringTaskCount} recurring task{selectedRecurringTaskCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        {totalTaskCount > 10 && (
          <div className="flex items-center space-x-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span>
              This operation might take some time for a large number of tasks.
            </span>
          </div>
        )}
      </div>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Please confirm</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>This action will create copies of selected tasks in the target client. 
          The original tasks will remain unchanged.</p>
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>Task details like name, description, and estimated hours will be copied exactly</li>
            <li>Task status will be set to "Unscheduled"</li>
            <li>Any existing assignments will not be copied</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={isProcessing}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleCopy}
          disabled={isProcessing}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Copy className="h-4 w-4 mr-2" />
          {isProcessing ? 'Copying Tasks...' : 'Copy Tasks'}
        </Button>
      </div>
    </div>
  );
};
