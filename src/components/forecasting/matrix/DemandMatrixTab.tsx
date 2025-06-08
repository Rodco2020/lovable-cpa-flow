
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DemandMatrix } from './DemandMatrix';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DemandMatrixTabProps {
  className?: string;
}

/**
 * Demand Matrix Tab Component
 * 
 * New tab for the forecasting dashboard that displays demand-only matrix data.
 * Follows the existing MatrixTab pattern while providing demand-specific functionality.
 */
export const DemandMatrixTab: React.FC<DemandMatrixTabProps> = ({ 
  className 
}) => {
  const [groupingMode, setGroupingMode] = useState<'skill' | 'client'>('skill');

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Demand Forecast Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Interactive 12-month demand view based on client-assigned recurring tasks
            </p>
          </div>
          
          {/* Grouping mode selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Group by:</span>
            <div className="flex rounded-md border">
              <Button
                variant={groupingMode === 'skill' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGroupingMode('skill')}
                className="rounded-r-none"
              >
                Skill
              </Button>
              <Button
                variant={groupingMode === 'client' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGroupingMode('client')}
                className="rounded-l-none"
              >
                Client
              </Button>
            </div>
          </div>
        </div>

        {/* Information card explaining demand forecasting */}
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            <strong>Demand Forecast:</strong> Projects future workload based on active recurring tasks from client assignments. 
            Use the controls to filter by skills/clients and toggle between skill-based and client-based grouping views.
          </AlertDescription>
        </Alert>
        
        {/* Enhanced demand matrix component */}
        <DemandMatrix groupingMode={groupingMode} />
      </div>
    </div>
  );
};

export default DemandMatrixTab;
