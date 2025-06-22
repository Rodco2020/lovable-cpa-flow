
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Download, RotateCcw } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { useDemandMatrixFilteringFixed } from '../hooks/useDemandMatrixFilteringFixed';
import { FilteringValidationService } from '@/services/forecasting/demand/dataFetcher/filteringValidationService';

// Import existing filter components
import { SkillsFilterSection } from './components/SkillsFilter';
import { ClientsFilterSection } from '../components/demand/ClientsFilterSection';
import { PreferredStaffFilterSection } from '../components/demand/PreferredStaffFilterSection';
import { MonthRangeSelector } from '../components/demand/MonthRangeSelector';

interface DemandMatrixControlsFixedProps {
  demandData: DemandMatrixData | null;
  isLoading?: boolean;
  onExport?: () => void;
  groupingMode?: 'skill' | 'client';
}

/**
 * FIXED: Demand Matrix Controls Component
 * 
 * FIXES IMPLEMENTED:
 * - Uses the corrected filtering hook
 * - Enhanced validation and diagnostics
 * - Improved state management
 * - Better error handling and user feedback
 */
export const DemandMatrixControlsFixed: React.FC<DemandMatrixControlsFixedProps> = ({
  demandData,
  isLoading = false,
  onExport,
  groupingMode = 'skill'
}) => {
  // UI state
  const [isControlsExpanded, setIsControlsExpanded] = useState(true);
  
  // Filter state
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedPreferredStaff, setSelectedPreferredStaff] = useState<string[]>([]);
  const [monthRange, setMonthRange] = useState({ start: 0, end: 5 });
  const [preferredStaffFilterMode, setPreferredStaffFilterMode] = useState<'all' | 'specific' | 'none'>('all');

  // Derived state
  const availableSkills = demandData?.skills || [];
  const availableClients = React.useMemo(() => {
    if (!demandData) return [];
    const clientsSet = new Set<{id: string, name: string}>();
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        if (task.clientId && task.clientName) {
          clientsSet.add({ id: task.clientId, name: task.clientName });
        }
      });
    });
    return Array.from(clientsSet);
  }, [demandData]);

  const availablePreferredStaff = React.useMemo(() => {
    if (!demandData) return [];
    const staffSet = new Set<{id: string, name: string}>();
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        if (task.preferredStaff) {
          const staffId = FilteringValidationService.extractStaffId(task.preferredStaff);
          if (staffId) {
            const staffName = typeof task.preferredStaff === 'object' 
              ? (task.preferredStaff.full_name || task.preferredStaff.name || staffId)
              : staffId;
            staffSet.add({ id: staffId, name: staffName });
          }
        }
      });
    });
    return Array.from(staffSet);
  }, [demandData]);

  const isAllSkillsSelected = selectedSkills.length === 0 || selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = selectedClients.length === 0 || selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = selectedPreferredStaff.length === 0 || selectedPreferredStaff.length === availablePreferredStaff.length;

  // FIXED: Use the corrected filtering hook
  const filteredData = useDemandMatrixFilteringFixed({
    demandData,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode
  });

  // Filter handlers
  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  }, []);

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(c => c !== clientId)
        : [...prev, clientId]
    );
  }, []);

  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setSelectedPreferredStaff(prev => 
      prev.includes(staffId)
        ? prev.filter(s => s !== staffId)
        : [...prev, staffId]
    );
  }, []);

  const handleReset = useCallback(() => {
    console.log('🔄 [FIXED] Resetting all filters');
    setSelectedSkills([]);
    setSelectedClients([]);
    setSelectedPreferredStaff([]);
    setPreferredStaffFilterMode('all');
    setMonthRange({ start: 0, end: 5 });
  }, []);

  const handleExport = useCallback(() => {
    console.log('📤 [FIXED] Exporting with current filters:', {
      preferredStaffFilterMode,
      selectedPreferredStaffCount: selectedPreferredStaff.length,
      filteredDataPoints: filteredData?.dataPoints.length || 0
    });
    onExport?.();
  }, [onExport, preferredStaffFilterMode, selectedPreferredStaff.length, filteredData]);

  // Validation diagnostics
  const validationResult = React.useMemo(() => {
    if (!demandData) return null;
    return FilteringValidationService.validateDataStructure(demandData);
  }, [demandData]);

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Loading Controls...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Demand Matrix Controls (Fixed)</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
          >
            {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {filteredData && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.dataPoints.length} data points ({filteredData.totalDemand.toFixed(1)}h total)
          </div>
        )}
      </CardHeader>

      {isControlsExpanded && (
        <CardContent className="space-y-6">
          {/* Validation Status */}
          {validationResult && !validationResult.isValid && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-sm font-medium text-yellow-800">Data Validation Issues:</div>
              <ul className="text-sm text-yellow-700 mt-1">
                {validationResult.issues.slice(0, 3).map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Month Range */}
          <MonthRangeSelector
            months={demandData?.months || []}
            monthRange={monthRange}
            onMonthRangeChange={setMonthRange}
          />

          {/* Skills Filter */}
          <SkillsFilterSection
            selectedSkills={selectedSkills}
            onSkillToggle={handleSkillToggle}
            availableSkills={availableSkills}
            isAllSelected={isAllSkillsSelected}
          />

          {/* Clients Filter */}
          <ClientsFilterSection
            selectedClients={selectedClients}
            onClientToggle={handleClientToggle}
            availableClients={availableClients}
            isAllSelected={isAllClientsSelected}
          />

          {/* FIXED: Preferred Staff Filter */}
          <PreferredStaffFilterSection
            selectedPreferredStaff={selectedPreferredStaff}
            onPreferredStaffToggle={handlePreferredStaffToggle}
            availablePreferredStaff={availablePreferredStaff}
            isAllSelected={isAllPreferredStaffSelected}
            filterMode={preferredStaffFilterMode}
            onFilterModeChange={setPreferredStaffFilterMode}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && filteredData && (
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
              Debug: {filteredData.dataPoints.length} points | Mode: {preferredStaffFilterMode} | 
              Staff: {selectedPreferredStaff.length} selected
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DemandMatrixControlsFixed;
