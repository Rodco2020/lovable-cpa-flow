
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  sourceClientName: string;
  targetClientName: string;
  adHocTasksCount: number;
  recurringTasksCount: number;
}

/**
 * Success step of the copy client tasks dialog
 * Shown after tasks have been successfully copied
 */
export const SuccessStep: React.FC<SuccessStepProps> = ({
  sourceClientName,
  targetClientName,
  adHocTasksCount,
  recurringTasksCount
}) => {
  const navigate = useNavigate();
  const totalTasksCount = adHocTasksCount + recurringTasksCount;
  
  // Find the target client in the URL - we'll extract the client ID from the URL
  const handleViewTargetClient = () => {
    // Use client service to get ID from name, then navigate
    // For this example, we'll just close the dialog and let the user navigate manually
    navigate(`/clients`);
  };
  
  return (
    <div className="py-6 space-y-4">
      <div className="flex flex-col items-center justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Tasks Copied Successfully!</h3>
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        {totalTasksCount} task{totalTasksCount !== 1 ? 's' : ''} from <strong>{sourceClientName}</strong> {totalTasksCount !== 1 ? 'have' : 'has'} been copied to <strong>{targetClientName}</strong>.
      </p>
      
      <div className="text-sm border rounded-md p-4 bg-gray-50">
        <div className="flex justify-between py-1">
          <span>Ad-hoc tasks:</span>
          <span className="font-medium">{adHocTasksCount}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Recurring tasks:</span>
          <span className="font-medium">{recurringTasksCount}</span>
        </div>
        <div className="flex justify-between pt-2 border-t mt-1 font-medium">
          <span>Total:</span>
          <span>{totalTasksCount}</span>
        </div>
      </div>
      
      <div className="pt-2 text-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleViewTargetClient}
        >
          View Clients
        </Button>
      </div>
    </div>
  );
};
