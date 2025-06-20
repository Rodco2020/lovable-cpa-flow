
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RotateCcw, 
  Printer 
} from 'lucide-react';
import { PreferredStaffFilterEnhanced } from './components/PreferredStaffFilterEnhanced';
import { TimeRangeControls } from './components/TimeRangeControls';
import { SkillsFilterSection } from './components/SkillsFilterSection';
import { ClientsFilterSection } from './components/ClientsFilterSection';
import { ActionButtonsSection } from './components/ActionButtonsSection';
import { SelectionSummary } from './components/SelectionSummary';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
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
  // Phase 2: Enhanced three-mode preferred staff filter props
  preferredStaffFilterMode?: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange?: (mode: 'all' | 'specific' | 'none') => void;
  preferredStaffLoading?: boolean;
  onPrintExport?: () => void;
}

/**
 * Phase 2: Enhanced DemandMatrixControlsPanel Component
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Integrated PreferredStaffFilterEnhanced with three-mode system
 * - Added proper loading states and error handling
 * - Connected preferredStaffFilterMode state to UI components
 * - Wired up onPreferredStaffFilterModeChange handler
 * - Enhanced visual indicators for each mode
 * - Maintained all existing functionality and responsive design
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
  // Phase 2: Three-mode filter props with defaults
  preferredStaffFilterMode = 'all',
  onPreferredStaffFilterModeChange = () => {},
  preferredStaffLoading = false,
  onPrintExport
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  console.log(`🎯 [PHASE 2 UI INTEGRATION] DemandMatrixControlsPanel - Rendering with enhanced preferred staff filter:`, {
    preferredStaffFilterMode,
    availablePreferredStaffCount: availablePreferredStaff.length,
    selectedPreferredStaffCount: selectedPreferredStaff.length,
    preferredStaffLoading,
    isControlsExpanded
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Matrix Controls</h3>
            {/* Phase 2: Visual indicator for preferred staff filter mode */}
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                preferredStaffFilterMode === 'all' && 'bg-green-100 text-green-800'
              } ${
                preferredStaffFilterMode === 'specific' && 'bg-blue-100 text-blue-800'
              } ${
                preferredStaffFilterMode === 'none' && 'bg-orange-100 text-orange-800'
              }`}
            >
              {preferredStaffFilterMode === 'all' && '🌐 All Tasks'}
              {preferredStaffFilterMode === 'specific' && '🎯 Specific Staff'}
              {preferredStaffFilterMode === 'none' && '❌ Unassigned'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleControls}
              className="flex items-center gap-1"
            >
              {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isControlsExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Range Control */}
        <TimeRangeControls
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          monthNames={monthNames}
        />

        <Separator />

        {/* Skills Filter */}
        <SkillsFilterSection
          availableSkills={availableSkills}
          selectedSkills={selectedSkills}
          onSkillToggle={onSkillToggle}
          isAllSkillsSelected={isAllSkillsSelected}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Clients Filter */}
        <ClientsFilterSection
          availableClients={availableClients}
          selectedClients={selectedClients}
          onClientToggle={onClientToggle}
          isAllClientsSelected={isAllClientsSelected}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Phase 2: Enhanced Preferred Staff Filter with Three-Mode System */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Preferred Staff</h4>
            {preferredStaffLoading && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Loading...
              </Badge>
            )}
          </div>
          
          {/* Phase 2: Enhanced Preferred Staff Filter Integration */}
          <PreferredStaffFilterEnhanced
            availablePreferredStaff={availablePreferredStaff}
            selectedPreferredStaff={selectedPreferredStaff}
            onPreferredStaffToggle={onPreferredStaffToggle}
            preferredStaffFilterMode={preferredStaffFilterMode}
            onPreferredStaffFilterModeChange={onPreferredStaffFilterModeChange}
            className="w-full"
          />
          
          {/* Phase 2: Additional context for collapsed view */}
          {!isControlsExpanded && (
            <div className="text-xs text-muted-foreground mt-2">
              {preferredStaffFilterMode === 'all' && 
                `Showing all tasks (${availablePreferredStaff.length} staff available)`
              }
              {preferredStaffFilterMode === 'specific' && 
                `Filtering by ${selectedPreferredStaff.length}/${availablePreferredStaff.length} staff`
              }
              {preferredStaffFilterMode === 'none' && 
                'Showing unassigned tasks only'
              }
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <ActionButtonsSection
          onPrintExport={onPrintExport}
          onExport={onExport}
          onReset={onReset}
        />

        {/* Current Selection Summary */}
        <SelectionSummary
          groupingMode={groupingMode}
          monthRange={monthRange}
          monthNames={monthNames}
          isAllSkillsSelected={isAllSkillsSelected}
          selectedSkills={selectedSkills}
          isAllClientsSelected={isAllClientsSelected}
          selectedClients={selectedClients}
          availablePreferredStaff={availablePreferredStaff}
          isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          selectedPreferredStaff={selectedPreferredStaff}
          // Phase 2: Enhanced summary with filter mode context
          preferredStaffFilterMode={preferredStaffFilterMode}
        />
      </CardContent>
    </Card>
  );
};
