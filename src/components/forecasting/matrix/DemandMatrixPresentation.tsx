
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { DemandDrillDownData } from '@/types/demandDrillDown';
import {
  DemandMatrixHeader,
  DemandMatrixGrid,
  DemandMatrixControlsPanel,
  DemandMatrixLoadingState,
  DemandMatrixErrorState,
  DemandMatrixEmptyState,
  DemandMatrixSummaryFooter,
  DemandDrillDownDialog,
  DemandMatrixTimeControls,
  DemandMatrixExportDialog
} from './components/demand';
import { DemandMatrixErrorBoundary } from './components/demand/DemandMatrixErrorBoundary';
import { DemandMatrixPrintExportDialog } from './components/demand/DemandMatrixPrintExportDialog';

interface DemandMatrixPresentationProps {
  className?: string;
  groupingMode: 'skill' | 'client';
  demandData: DemandMatrixData | null;
  filteredData: DemandMatrixData | null;
  isLoading: boolean;
  error: string | null;
  validationIssues: string[];
  isControlsExpanded: boolean;
  retryCount: number;
  drillDownData: DemandDrillDownData | null;
  selectedDrillDown: {skill: SkillType; month: string} | null;
  showExportDialog: boolean;
  showPrintExportDialog: boolean;
  timeHorizon: 'quarter' | 'half-year' | 'year' | 'custom';
  customDateRange: {start: Date; end: Date} | undefined;
  demandMatrixControls: any; // This maintains the exact same interface as before
  onToggleControls: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  onCellClick: (skill: SkillType, month: string) => void;
  onTimeHorizonChange: (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => void;
  onCustomDateRangeChange: (range: {start: Date; end: Date} | undefined) => void;
  onShowExport: () => void;
  onShowPrintExport: () => void;
  onCloseDrillDown: () => void;
  onCloseExportDialog: () => void;
  onClosePrintExportDialog: () => void;
}

/**
 * Pure UI Presentation Component for Demand Matrix
 * 
 * This component is responsible solely for rendering the UI and handling user interactions.
 * It receives all necessary data and handlers as props, making it a pure presentation component
 * with no business logic or side effects.
 */
export const DemandMatrixPresentation: React.FC<DemandMatrixPresentationProps> = ({
  className,
  groupingMode,
  demandData,
  filteredData,
  isLoading,
  error,
  validationIssues,
  isControlsExpanded,
  retryCount,
  drillDownData,
  selectedDrillDown,
  showExportDialog,
  showPrintExportDialog,
  timeHorizon,
  customDateRange,
  demandMatrixControls,
  onToggleControls,
  onRefresh,
  onRetry,
  onCellClick,
  onTimeHorizonChange,
  onCustomDateRangeChange,
  onShowExport,
  onShowPrintExport,
  onCloseDrillDown,
  onCloseExportDialog,
  onClosePrintExportDialog,
}) => {
  // Loading state with enhanced information
  if (isLoading || demandMatrixControls.skillsLoading || demandMatrixControls.clientsLoading) {
    return (
      <DemandMatrixErrorBoundary>
        <DemandMatrixLoadingState 
          className={className}
          groupingMode={groupingMode}
        />
      </DemandMatrixErrorBoundary>
    );
  }

  // Error state with retry capability
  if (error) {
    return (
      <DemandMatrixErrorBoundary>
        <DemandMatrixErrorState
          className={className}
          error={error}
          onRetry={onRetry}
          groupingMode={groupingMode}
        />
      </DemandMatrixErrorBoundary>
    );
  }

  // No data state with enhanced guidance
  if (!filteredData || filteredData.dataPoints.length === 0) {
    return (
      <DemandMatrixErrorBoundary>
        <DemandMatrixEmptyState
          className={className}
          groupingMode={groupingMode}
          onRefresh={onRefresh}
        />
      </DemandMatrixErrorBoundary>
    );
  }

  return (
    <DemandMatrixErrorBoundary>
      <div className={className}>
        {/* Responsive layout for matrix and controls */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Controls Panel - Enhanced with time controls */}
          <div className={`xl:col-span-1 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
            <div className="space-y-4">
              {/* Time Horizon Controls */}
              <DemandMatrixTimeControls
                timeHorizon={timeHorizon}
                customDateRange={customDateRange}
                onTimeHorizonChange={onTimeHorizonChange}
                onCustomDateRangeChange={onCustomDateRangeChange}
              />
              
              {/* Standard Controls Panel */}
              <DemandMatrixControlsPanel
                isControlsExpanded={isControlsExpanded}
                onToggleControls={onToggleControls}
                selectedSkills={demandMatrixControls.selectedSkills}
                selectedClients={demandMatrixControls.selectedClients}
                onSkillToggle={demandMatrixControls.handleSkillToggle}
                onClientToggle={demandMatrixControls.handleClientToggle}
                monthRange={demandMatrixControls.monthRange}
                onMonthRangeChange={demandMatrixControls.handleMonthRangeChange}
                onExport={onShowExport}
                onReset={demandMatrixControls.handleReset}
                groupingMode={groupingMode}
                availableSkills={demandMatrixControls.availableSkills}
                availableClients={demandMatrixControls.availableClients}
                onPrintExport={onShowPrintExport}
              />
            </div>
          </div>
          
          {/* Matrix Panel */}
          <div className={`xl:col-span-4 ${isControlsExpanded ? 'xl:col-span-3' : ''}`}>
            <Card>
              <CardHeader>
                <DemandMatrixHeader
                  groupingMode={groupingMode}
                  isLoading={isLoading}
                  validationIssues={validationIssues}
                  onRefresh={onRefresh}
                />
              </CardHeader>
              <CardContent>
                {/* Enhanced Grid with Click Handling */}
                <div onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const skillOrClient = target.getAttribute('data-skill');
                  const month = target.getAttribute('data-month');
                  
                  if (skillOrClient && month) {
                    onCellClick(skillOrClient as SkillType, month);
                  }
                }}>
                  <DemandMatrixGrid
                    filteredData={filteredData}
                    groupingMode={groupingMode}
                  />
                </div>
                
                <DemandMatrixSummaryFooter
                  filteredData={filteredData}
                  validationIssues={validationIssues}
                  groupingMode={groupingMode}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Phase 4: Advanced Feature Dialogs */}
        
        {/* Drill-Down Dialog */}
        <DemandDrillDownDialog
          isOpen={!!drillDownData}
          onClose={onCloseDrillDown}
          skill={selectedDrillDown?.skill || null}
          month={selectedDrillDown?.month || null}
          data={drillDownData}
        />

        {/* Export Dialog */}
        {demandData && (
          <DemandMatrixExportDialog
            isOpen={showExportDialog}
            onClose={onCloseExportDialog}
            demandData={demandData}
            selectedSkills={demandMatrixControls.selectedSkills}
            selectedClients={demandMatrixControls.selectedClients}
            monthRange={demandMatrixControls.monthRange}
            groupingMode={groupingMode}
          />
        )}

        {/* Print/Export Dialog */}
        {demandData && (
          <DemandMatrixPrintExportDialog
            isOpen={showPrintExportDialog}
            onClose={onClosePrintExportDialog}
            demandData={filteredData}
            selectedSkills={demandMatrixControls.selectedSkills}
            selectedClients={demandMatrixControls.selectedClients}
            monthRange={demandMatrixControls.monthRange}
            groupingMode={groupingMode}
          />
        )}
      </div>
    </DemandMatrixErrorBoundary>
  );
};
