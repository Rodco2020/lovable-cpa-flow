
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DemandMatrixSummaryFooterProps {
  filteredData: DemandMatrixData;
  validationIssues: string[];
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixSummaryFooter: React.FC<DemandMatrixSummaryFooterProps> = ({
  filteredData,
  validationIssues,
  groupingMode
}) => {
  const totalHours = filteredData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
  const totalTasks = filteredData.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
  const totalClients = Array.from(new Set(
    filteredData.dataPoints.flatMap(point => 
      point.taskBreakdown.map(task => task.clientId)
    )
  )).length;

  return (
    <div className="mt-4 space-y-3">
      {/* Summary metrics */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="px-3 py-1">
          Total Demand: {totalHours.toFixed(1)} hours
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Tasks: {totalTasks}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Clients: {totalClients}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          {groupingMode === 'skill' ? 'Skills' : 'Client Groups'}: {filteredData.skills.length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Months: {filteredData.months.length}
        </Badge>
      </div>

      {/* Validation issues */}
      {validationIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Quality Issues:</strong> {validationIssues.slice(0, 3).join(', ')}
            {validationIssues.length > 3 && ` and ${validationIssues.length - 3} more issues`}
          </AlertDescription>
        </Alert>
      )}

      {/* Helpful information */}
      <div className="text-xs text-muted-foreground">
        <p>
          Demand forecast based on {groupingMode === 'skill' ? 'skill-based grouping' : 'client-based grouping'}. 
          Hover over cells for detailed task breakdowns.
        </p>
      </div>
    </div>
  );
};
