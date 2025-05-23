
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfirmationStepProps {
  sourceClientName: string;
  targetClientName: string;
  selectedAdHocTaskCount: number;
  selectedRecurringTaskCount: number;
}

/**
 * Third step of the copy client tasks dialog
 * Shows confirmation details before copying
 */
export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  sourceClientName,
  targetClientName,
  selectedAdHocTaskCount,
  selectedRecurringTaskCount
}) => {
  const totalTaskCount = selectedAdHocTaskCount + selectedRecurringTaskCount;
  
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
      </div>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Please confirm</AlertTitle>
        <AlertDescription className="text-amber-700">
          This action will create copies of selected tasks in the target client. 
          The original tasks will remain unchanged.
        </AlertDescription>
      </Alert>
    </div>
  );
};
