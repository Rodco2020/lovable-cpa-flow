
import React from 'react';
import { Users, FileText } from 'lucide-react';

interface OperationSummaryProps {
  selectedClientCount: number;
  selectedTemplateCount: number;
}

export const OperationSummary: React.FC<OperationSummaryProps> = ({
  selectedClientCount,
  selectedTemplateCount
}) => {
  const totalOperations = selectedClientCount * selectedTemplateCount;

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 text-2xl font-bold">
          <Users className="h-6 w-6" />
          <span>{selectedClientCount}</span>
        </div>
        <p className="text-sm text-muted-foreground">Clients</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 text-2xl font-bold">
          <FileText className="h-6 w-6" />
          <span>{selectedTemplateCount}</span>
        </div>
        <p className="text-sm text-muted-foreground">Templates</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalOperations}</div>
        <p className="text-sm text-muted-foreground">Total Operations</p>
      </div>
    </div>
  );
};
