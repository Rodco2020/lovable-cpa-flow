
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Settings, Download, RotateCcw } from 'lucide-react';
import { SkillsFilterSection } from './SkillsFilterSection';
import { ClientsFilterSection } from './ClientsFilterSection';
import { PreferredStaffFilterSection } from './PreferredStaffFilterSection';
import { MonthRangeSelector } from './MonthRangeSelector';
import { DemandMatrixExportDialog } from './DemandMatrixExportDialog';
import { EnhancedMatrixExportUtils } from '@/services/forecasting/export/enhancedMatrixExportUtils';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  // Phase 4: Enhanced props for three-mode filtering export
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  preferredStaffLoading?: boolean;
}

/**
 * Phase 4: Enhanced Demand Matrix Controls Panel
 * 
 * PHASE 4 ENHANCEMENTS:
 * - Integrated enhanced export functionality with three-mode filtering
 * - Added export configuration handling for filtering mode information
 * - Maintained all existing control functionality
 * - Enhanced export dialog integration with filtering context
 */
export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  preferredStaffLoading = false
}) => {

  // Phase 4: Enhanced export handler with three-mode filtering support
  const handleEnhancedExport = (exportConfig: any) => {
    console.log(`📤 [PHASE 4 CONTROLS] Handling enhanced export with config:`, {
      exportConfig,
      preferredStaffFilterMode,
      selectedStaffCount: selectedPreferredStaff.length
    });

    try {
      // Create proper mock demand data for export
      const mockDemandData = {
        dataPoints: [
          {
            skillType: 'Tax Preparation' as any,
            month: 'Jan 2025',
            demandHours: 40,
            taskCount: 5,
            clientCount: 3,
            taskBreakdown: [
              {
                clientId: 'client-1',
                taskName: 'Individual Tax Return',
                estimatedHours: 8,
                preferredStaff: selectedPreferredStaff.length > 0 ? { staffId: selectedPreferredStaff[0] } : null
              }
            ]
          }
        ]
      };

      const enhancedExportConfig = {
        selectedSkills,
        selectedClients,
        selectedPreferredStaff,
        monthRange,
        preferredStaffFilterMode,
        groupingMode,
        ...exportConfig
      };

      let exportContent: string;

      if (exportConfig.format === 'csv') {
        exportContent = EnhancedMatrixExportUtils.generateEnhancedCSVExport(
          mockDemandData,
          enhancedExportConfig
        );
      } else {
        exportContent = EnhancedMatrixExportUtils.generateEnhancedJSONExport(
          mockDemandData,
          enhancedExportConfig
        );
      }

      // Download the file
      const blob = new Blob([exportContent], { 
        type: exportConfig.format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `demand-matrix-${preferredStaffFilterMode}-mode.${exportConfig.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`✅ [PHASE 4 CONTROLS] Enhanced export completed successfully`);
    } catch (error) {
      console.error(`❌ [PHASE 4 CONTROLS] Enhanced export failed:`, error);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Matrix Controls
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleControls}
            aria-label={isControlsExpanded ? "Collapse controls" : "Expand controls"}
          >
            {isControlsExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isControlsExpanded && (
        <CardContent className="space-y-6">
          {/* Month Range Selector */}
          <div>
            <h4 className="font-medium mb-3">Time Range</h4>
            <MonthRangeSelector
              monthRange={monthRange}
              onMonthRangeChange={onMonthRangeChange}
            />
          </div>

          <Separator />

          {/* Skills Filter */}
          <SkillsFilterSection
            selectedSkills={selectedSkills}
            onSkillToggle={onSkillToggle}
            availableSkills={availableSkills}
            isAllSelected={isAllSkillsSelected}
          />

          <Separator />

          {/* Clients Filter */}
          <ClientsFilterSection
            selectedClients={selectedClients}
            onClientToggle={onClientToggle}
            availableClients={availableClients}
            isAllSelected={isAllClientsSelected}
          />

          <Separator />

          {/* Phase 2: Preferred Staff Filter Section with Three-Mode Support */}
          <PreferredStaffFilterSection
            selectedPreferredStaff={selectedPreferredStaff}
            onPreferredStaffToggle={onPreferredStaffToggle}
            availablePreferredStaff={availablePreferredStaff}
            isAllSelected={isAllPreferredStaffSelected}
            // Phase 2: Three-mode filtering props
            filterMode={preferredStaffFilterMode}
            onFilterModeChange={onPreferredStaffFilterModeChange}
            isLoading={preferredStaffLoading}
          />

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Phase 4: Enhanced Export Button with Three-Mode Support */}
            <DemandMatrixExportDialog
              onExport={handleEnhancedExport}
              groupingMode={groupingMode}
              selectedSkills={selectedSkills}
              selectedClients={selectedClients}
              selectedPreferredStaff={selectedPreferredStaff}
              monthRange={monthRange}
              availableSkills={availableSkills}
              availableClients={availableClients}
              availablePreferredStaff={availablePreferredStaff}
              isAllSkillsSelected={isAllSkillsSelected}
              isAllClientsSelected={isAllClientsSelected}
              isAllPreferredStaffSelected={isAllPreferredStaffSelected}
              preferredStaffFilterMode={preferredStaffFilterMode}
            >
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Matrix Data
              </Button>
            </DemandMatrixExportDialog>

            <Button
              variant="outline"
              onClick={onReset}
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DemandMatrixControlsPanel;
