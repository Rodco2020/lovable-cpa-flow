
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Users, Briefcase } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';

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
  const totalFilteredDemand = filteredData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
  const totalFilteredTasks = filteredData.dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
  const totalFilteredClients = new Set(
    filteredData.dataPoints.flatMap(point => 
      point.taskBreakdown.map(task => task.clientId)
    )
  ).size;

  const averageDemandPerMonth = filteredData.months.length > 0 
    ? totalFilteredDemand / filteredData.months.length 
    : 0;

  const averageTasksPerSkill = filteredData.skills.length > 0 
    ? totalFilteredTasks / filteredData.skills.length 
    : 0;

  return (
    <div className="mt-6 space-y-4">
      {/* Validation Issues Alert */}
      {validationIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Data Quality Issues Detected</div>
            <ul className="text-sm list-disc list-inside">
              {validationIssues.slice(0, 3).map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
              {validationIssues.length > 3 && (
                <li>...and {validationIssues.length - 3} more issues</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Demand</span>
              </div>
              <div className="text-lg font-bold">{totalFilteredDemand.toFixed(0)}h</div>
              <div className="text-xs text-muted-foreground">
                {averageDemandPerMonth.toFixed(1)}h avg/month
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Briefcase className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Tasks</span>
              </div>
              <div className="text-lg font-bold">{totalFilteredTasks}</div>
              <div className="text-xs text-muted-foreground">
                {averageTasksPerSkill.toFixed(1)} avg/{groupingMode}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Active Clients</span>
              </div>
              <div className="text-lg font-bold">{totalFilteredClients}</div>
              <div className="text-xs text-muted-foreground">
                in current view
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-medium">Coverage</span>
              </div>
              <div className="text-lg font-bold">
                {filteredData.skills.length}/{groupingMode === 'skill' ? 'skills' : 'clients'}
              </div>
              <div className="text-xs text-muted-foreground">
                {filteredData.months.length} months
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Matrix: {filteredData.skills.length} × {filteredData.months.length}
              </Badge>
              
              {totalFilteredDemand > 1000 && (
                <Badge variant="secondary" className="text-xs">
                  High Volume
                </Badge>
              )}
              
              {totalFilteredClients > 10 && (
                <Badge variant="secondary" className="text-xs">
                  Multi-Client
                </Badge>
              )}
              
              {validationIssues.length === 0 && (
                <Badge variant="success" className="text-xs">
                  Data Validated
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
