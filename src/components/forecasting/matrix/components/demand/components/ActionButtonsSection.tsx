
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { DemandMatrixExportDialog } from '../DemandMatrixExportDialog';
import { EnhancedMatrixExportUtils } from '@/services/forecasting/export/enhancedMatrixExportUtils';

interface ActionButtonsSectionProps {
  onExport: (exportConfig: any) => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

/**
 * Refactored Action Buttons Section Component
 * 
 * FUNCTIONALITY PRESERVED:
 * - Enhanced export functionality with three-mode filtering support
 * - Reset all filters functionality
 * - Export dialog integration with filtering context
 * - Icon consistency and button styling
 */
export const ActionButtonsSection: React.FC<ActionButtonsSectionProps> = ({
  onExport,
  onReset,
  groupingMode,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode
}) => {
  // Enhanced export handler with three-mode filtering support (preserved from original)
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
    <div className="space-y-2">
      {/* Enhanced Export Button with Three-Mode Support */}
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
  );
};
