import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, FileText } from 'lucide-react';
import { DetailMatrixContainer } from './DetailMatrixContainer';

interface DetailMatrixTabProps {
  className?: string;
}

/**
 * Detail Matrix Tab Component - Phase 1
 * 
 * New tab for the forecasting dashboard that displays task-level detail data.
 * This is Phase 1 implementation focusing on recurring tasks only.
 */
export const DetailMatrixTab: React.FC<DetailMatrixTabProps> = ({ 
  className 
}) => {
  const [groupingMode, setGroupingMode] = useState<'skill' | 'client'>('client');

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Phase 1 Development Banner */}
        <Alert className="bg-blue-50 border-blue-200">
          <FileText className="h-4 w-4" />
          <AlertDescription className="text-blue-700">
            <strong>Detail Matrix - Phase 1 Development:</strong> Currently showing recurring task details. 
            Ad-hoc tasks and advanced filtering will be added in future phases.
          </AlertDescription>
        </Alert>

        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Detail Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Task-level view of recurring assignments with drill-down capabilities
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

        {/* Information card explaining detail matrix */}
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            <strong>Task Detail View:</strong> Shows individual recurring tasks with monthly breakdown. 
            This provides task-level visibility into your demand forecasting data.
          </AlertDescription>
        </Alert>
        
        {/* Detail matrix container */}
        <DetailMatrixContainer groupingMode={groupingMode} />
      </div>
    </div>
  );
};

export default DetailMatrixTab;