import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DemandMatrixData, StaffUtilizationData } from '@/types/demand';

interface DetailMatrixPresentationProps {
  className?: string;
  groupingMode: 'skill' | 'client';
  initialViewMode?: string;
  data: DemandMatrixData | null;
  filteredData: DemandMatrixData | null;
  filteredTasks: any[];
  utilizationData: StaffUtilizationData[];
  isLoading: boolean;
  staffLoading: boolean;
  error: string | null;
  validationIssues: string[];
  isControlsExpanded: boolean;
  drillDownData: any;
  selectedDrillDown: any;
  showExportDialog: boolean;
  showPrintExportDialog: boolean;
  timeHorizon: any;
  customDateRange: any;
  demandMatrixControls: any;
  months: any[];
  onToggleControls: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  onCellClick: (skill: any, month: string) => Promise<void>;
  onTimeHorizonChange: (horizon: any) => void;
  onCustomDateRangeChange: (range: any) => void;
  onShowExport: () => void;
  onShowPrintExport: () => void;
  onCloseDrillDown: () => void;
  onCloseExportDialog: () => void;
  onClosePrintExportDialog: () => void;
}

/**
 * DetailMatrixPresentation - Renders the detail matrix view
 */
export const DetailMatrixPresentation: React.FC<DetailMatrixPresentationProps> = ({
  className,
  initialViewMode,
  filteredTasks,
  utilizationData,
  isLoading,
  staffLoading,
  error
}) => {
  if (isLoading || staffLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (initialViewMode === 'staff-forecast-summary') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Staff Forecast Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {utilizationData.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Found {utilizationData.length} staff members with utilization data
              </div>
              <div className="space-y-2">
                {utilizationData.map((staff) => (
                  <div key={staff.staffId} className="border rounded p-3">
                    <div className="font-medium">{staff.staffName}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Hours: {staff.totalHours} | Utilization: {staff.utilizationPercentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No staff utilization data found.
              <div className="text-xs mt-2">
                Filtered tasks: {filteredTasks.length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Detail Matrix</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          Detail matrix view for {filteredTasks.length} tasks
        </div>
      </CardContent>
    </Card>
  );
};