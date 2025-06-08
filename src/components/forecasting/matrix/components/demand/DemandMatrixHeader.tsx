
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DemandMatrixHeaderProps {
  groupingMode: 'skill' | 'client';
  isLoading: boolean;
  validationIssues: string[];
  onRefresh: () => void;
}

export const DemandMatrixHeader: React.FC<DemandMatrixHeaderProps> = ({
  groupingMode,
  isLoading,
  validationIssues,
  onRefresh
}) => {
  return (
    <CardTitle className="text-lg flex items-center justify-between">
      Demand Forecast Matrix
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Grouped by {groupingMode === 'skill' ? 'Skill' : 'Client'}
        </Badge>
        {validationIssues.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationIssues.length} issues
          </Badge>
        )}
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </CardTitle>
  );
};
