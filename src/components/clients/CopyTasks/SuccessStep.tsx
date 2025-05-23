
import React from 'react';
import { Check } from 'lucide-react';
import { RecurringTask, TaskInstance } from '@/types/task';

interface SuccessStepProps {
  copyResults: {
    recurring: RecurringTask[];
    adHoc: TaskInstance[];
  } | null;
  targetClientName?: string;
}

/**
 * Final step of the copy client tasks dialog
 * Shows a success message and summary of copied tasks
 */
export const SuccessStep: React.FC<SuccessStepProps> = ({
  copyResults,
  targetClientName
}) => {
  const totalCopied = copyResults ? copyResults.recurring.length + copyResults.adHoc.length : 0;
  
  return (
    <div className="py-6 space-y-6 text-center">
      <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1">Tasks Copied Successfully!</h3>
        <p className="text-sm text-gray-500">
          {totalCopied} task(s) have been copied to {targetClientName}
        </p>
      </div>
      
      {copyResults && (
        <div className="border rounded-md p-4 text-left bg-gray-50">
          <h4 className="font-medium mb-2">Summary</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {copyResults.adHoc.length > 0 && (
              <li>{copyResults.adHoc.length} ad-hoc task(s) copied</li>
            )}
            {copyResults.recurring.length > 0 && (
              <li>{copyResults.recurring.length} recurring task(s) copied</li>
            )}
            {(copyResults.adHoc.length === 0 && copyResults.recurring.length === 0) && (
              <li>No tasks were copied</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
