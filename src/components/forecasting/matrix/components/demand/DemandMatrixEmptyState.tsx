
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Plus, RefreshCw, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemandMatrixEmptyStateProps {
  className?: string;
  groupingMode: 'skill' | 'client';
  onRefresh?: () => void;
}

export const DemandMatrixEmptyState: React.FC<DemandMatrixEmptyStateProps> = ({
  className,
  groupingMode,
  onRefresh
}) => {
  const navigate = useNavigate();

  const handleNavigateToClients = () => {
    navigate('/clients');
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
            No Demand Data Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  No client-assigned tasks found for demand matrix ({groupingMode} view). 
                  This could be because:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>No recurring tasks have been assigned to clients</li>
                  <li>All recurring tasks are currently inactive</li>
                  <li>Applied filters exclude all available data</li>
                  <li>Tasks are not scheduled within the selected time horizon</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleNavigateToClients}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Manage Client Tasks
            </Button>
            
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              💡 <strong>Quick Start:</strong> Create recurring tasks for clients to see demand forecasts in the matrix view.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
