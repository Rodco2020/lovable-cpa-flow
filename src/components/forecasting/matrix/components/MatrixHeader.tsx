
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface MatrixHeaderProps {
  viewMode: 'hours' | 'percentage';
  forecastType: 'virtual' | 'actual';
  isLoading: boolean;
  validationIssues: string[];
  onRefresh: () => void;
}

export const MatrixHeader: React.FC<MatrixHeaderProps> = ({
  viewMode,
  forecastType,
  isLoading,
  validationIssues,
  onRefresh
}) => {
  return (
    <CardTitle className="text-lg flex items-center justify-between">
      Enhanced 12-Month Capacity Matrix
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {viewMode === 'hours' ? 'Hours' : 'Percentage'} View
        </Badge>
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
