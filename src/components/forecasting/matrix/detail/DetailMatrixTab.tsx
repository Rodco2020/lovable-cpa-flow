
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, FileText } from 'lucide-react';
import { DetailMatrix } from './DetailMatrix';
import { DetailMatrixErrorBoundary } from './DetailMatrixErrorBoundary';

interface DetailMatrixTabProps {
  className?: string;
}

/**
 * Detail Matrix Tab Component - Phase 3
 * 
 * New tab for the forecasting dashboard that displays task-level detail data.
 * Phase 3 complete: Full filter integration with existing controls.
 * 
 * SURGICAL FIX: Now uses DetailMatrix wrapper instead of DetailMatrixContainer
 * to ensure proper DemandMatrixStateProvider context.
 */
export const DetailMatrixTab: React.FC<DetailMatrixTabProps> = ({ 
  className 
}) => {
  const [groupingMode, setGroupingMode] = useState<'skill' | 'client'>('client');
  const [viewMode, setViewMode] = useState<'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix' | 'staff-forecast-summary'>('all-tasks');

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Phase 3 Development Banner */}
        <Alert className="bg-green-50 border-green-200">
          <FileText className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            <strong>Detail Matrix - Phase 3 Complete:</strong> Now includes full filter integration with Skills, Clients, and Preferred Staff filters. 
            All filter combinations work in both view modes with export capabilities.
          </AlertDescription>
        </Alert>

        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Detail Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Task-level view with multiple display modes and revenue calculations
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <div className="grid grid-cols-2 gap-1 rounded-md border bg-muted/30 p-1">
              <Button
                variant={viewMode === 'all-tasks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('all-tasks')}
                className="text-xs"
              >
                Show All Tasks
              </Button>
              <Button
                variant={viewMode === 'group-by-skill' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('group-by-skill')}
                className="text-xs"
              >
                Group by Skill
              </Button>
              <Button
                variant={viewMode === 'detail-forecast-matrix' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('detail-forecast-matrix')}
                className="text-xs"
              >
                Detail Forecast Matrix
              </Button>
              <Button
                variant={viewMode === 'staff-forecast-summary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('staff-forecast-summary')}
                className="text-xs"
              >
                Staff Forecast Summary
              </Button>
            </div>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-700">
            <strong>Enhanced Task Detail View:</strong> Individual recurring tasks with filter controls panel. 
            Use the left panel to filter by Skills, Clients, or Preferred Staff. Toggle between "Show All Tasks" and "Group by Skill" views.
          </AlertDescription>
        </Alert>
        
        {/* Detail matrix container - NOW USING WRAPPER WITH CONTEXT */}
        <DetailMatrixErrorBoundary>
          <DetailMatrix 
            groupingMode={groupingMode} 
            initialViewMode={viewMode} 
          />
        </DetailMatrixErrorBoundary>
      </div>
    </div>
  );
};

export default DetailMatrixTab;
