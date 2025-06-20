import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useQuery } from '@tanstack/react-query';
import { getPreferredStaffFromDatabase } from '@/services/staff/preferredStaffDataService';
import { manualCacheRefresh } from '@/services/staff/preferredStaffCacheInvalidation';
import { useDemandMatrixFiltering } from './useDemandMatrixFiltering';

interface UseDemandMatrixControlsProps {
  demandData?: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
}

interface DemandMatrixControlsState {
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  preferredStaffFilterMode: 'all' | 'specific' | 'none'; // Phase 2: New three-mode state
}

/**
 * Phase 2: Enhanced Demand Matrix Controls Hook - Three-Mode Preferred Staff Filtering
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Added preferredStaffFilterMode state with three distinct modes
 * - Enhanced state validation and error handling
 * - Improved state transition management
 * - Backward compatibility with existing functionality
 * - Advanced logging for debugging and monitoring
 */
export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps) => {
  // Phase 2: Enhanced state with three-mode preferred staff filtering
  const [state, setState] = useState<DemandMatrixControlsState>({
    selectedSkills: [],
    selectedClients: [],
    selectedPreferredStaff: [],
    monthRange: { start: 0, end: 11 },
    preferredStaffFilterMode: 'all' // Phase 2: Default to 'all' mode
  });

  // Fetch available skills and clients
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Enhanced preferred staff query with validation logging
  const { data: preferredStaffFromDB = [], isLoading: preferredStaffLoading, refetch: refetchPreferredStaff } = useQuery({
    queryKey: ['preferred-staff-database'],
    queryFn: getPreferredStaffFromDatabase,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
  });

  // Extract available options from demand data
  const availableSkills = demandData?.skills || [];
  
  // Extract ALL unique clients from task breakdowns without any limits
  const availableClients = Array.from(new Set(
    demandData?.dataPoints.flatMap(point => 
      point.taskBreakdown
        .filter(task => task.clientName && !task.clientName.includes('...'))
        .map(task => ({
          id: task.clientId,
          name: task.clientName
        }))
    ) || []
  ));

  // Use database-sourced preferred staff with validation
  const availablePreferredStaff = preferredStaffFromDB.map(staff => ({
    id: staff.id,
    name: staff.full_name
  }));

  // Phase 2: Enhanced selection state calculation with mode awareness
  const isAllSkillsSelected = availableSkills.length > 0 && state.selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = availableClients.length > 0 && state.selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && state.selectedPreferredStaff.length === availablePreferredStaff.length;

  // Phase 2: Use the enhanced filtering hook with three-mode system
  const filteredData = useDemandMatrixFiltering({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    selectedPreferredStaff: state.selectedPreferredStaff,
    monthRange: state.monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode: state.preferredStaffFilterMode // Phase 2: Pass the new filter mode
  });

  console.log(`🎛️ [MATRIX CONTROLS] Phase 2 - Enhanced three-mode filtering controls:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    availablePreferredStaff: availablePreferredStaff.length,
    selectedSkills: state.selectedSkills.length,
    selectedClients: state.selectedClients.length,
    selectedPreferredStaff: state.selectedPreferredStaff.length,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode: state.preferredStaffFilterMode,
    filteredDataPoints: filteredData?.dataPoints.length || 0,
    phase2Enhancement: 'THREE_MODE_SYSTEM_ACTIVE'
  });

  // Initialize selections when data becomes available - SELECT ALL by default
  useEffect(() => {
    if (demandData && 
        state.selectedSkills.length === 0 && 
        state.selectedClients.length === 0 && 
        state.selectedPreferredStaff.length === 0 &&
        !preferredStaffLoading) {
      setState(prev => ({
        ...prev,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id),
        selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id),
        preferredStaffFilterMode: 'all' // Phase 2: Ensure default mode is set
      }));
      
      console.log(`🎛️ [MATRIX CONTROLS] Phase 2 - Initialized with ALL selections and 'all' mode:`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        preferredStaffCount: availablePreferredStaff.length,
        defaultMode: 'all',
        phase2InitComplete: true
      });
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff, preferredStaffLoading]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
      console.log(`🔧 [MATRIX CONTROLS] Phase 2 - Skill toggle:`, {
        skill,
        action: prev.selectedSkills.includes(skill) ? 'removed' : 'added',
        newCount: newSelectedSkills.length,
        totalAvailable: availableSkills.length,
        currentMode: prev.preferredStaffFilterMode
      });

      return {
        ...prev,
        selectedSkills: newSelectedSkills
      };
    });
  }, [availableSkills.length]);

  // Handle client toggle
  const handleClientToggle = useCallback((clientId: string) => {
    setState(prev => {
      const newSelectedClients = prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(c => c !== clientId)
        : [...prev.selectedClients, clientId];

      console.log(`🔧 [MATRIX CONTROLS] Phase 2 - Client toggle:`, {
        clientId,
        action: prev.selectedClients.includes(clientId) ? 'removed' : 'added',
        newCount: newSelectedClients.length,
        totalAvailable: availableClients.length,
        currentMode: prev.preferredStaffFilterMode
      });

      return {
        ...prev,
        selectedClients: newSelectedClients
      };
    });
  }, [availableClients.length]);

  // Handle preferred staff toggle
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setState(prev => {
      const newSelectedPreferredStaff = prev.selectedPreferredStaff.includes(staffId)
        ? prev.selectedPreferredStaff.filter(s => s !== staffId)
        : [...prev.selectedPreferredStaff, staffId];

      // Phase 2: Enhanced logic for mode management
      let newMode = prev.preferredStaffFilterMode;
      
      // Auto-adjust mode based on selection state
      if (newSelectedPreferredStaff.length === 0) {
        // No staff selected - could be 'none' mode or user clearing for 'all' mode
        // Keep current mode unless it's 'specific' (which wouldn't make sense with no selections)
        if (prev.preferredStaffFilterMode === 'specific') {
          newMode = 'all'; // Default back to 'all' if specific mode but no selections
        }
      } else if (newSelectedPreferredStaff.length === availablePreferredStaff.length) {
        // All staff selected - likely 'all' mode
        if (prev.preferredStaffFilterMode === 'specific') {
          newMode = 'all'; // Switch to 'all' when all staff are selected in specific mode
        }
      } else {
        // Some staff selected - likely 'specific' mode
        if (prev.preferredStaffFilterMode === 'all' && newSelectedPreferredStaff.length < availablePreferredStaff.length) {
          newMode = 'specific'; // Switch to 'specific' when not all staff are selected
        }
      }

      console.log(`🔧 [MATRIX CONTROLS] Phase 2 - Preferred staff toggle with mode management:`, {
        staffId,
        action: prev.selectedPreferredStaff.includes(staffId) ? 'removed' : 'added',
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        previousMode: prev.preferredStaffFilterMode,
        newMode,
        modeChanged: newMode !== prev.preferredStaffFilterMode
      });

      return {
        ...prev,
        selectedPreferredStaff: newSelectedPreferredStaff,
        preferredStaffFilterMode: newMode
      };
    });
  }, [availablePreferredStaff.length]);

  // Phase 2: New handler for explicit filter mode changes
  const handlePreferredStaffFilterModeChange = useCallback((mode: 'all' | 'specific' | 'none') => {
    setState(prev => {
      let newSelectedPreferredStaff = prev.selectedPreferredStaff;
      
      // Adjust selections based on new mode
      if (mode === 'all') {
        // 'all' mode: select all available staff
        newSelectedPreferredStaff = availablePreferredStaff.map(staff => staff.id);
      } else if (mode === 'none') {
        // 'none' mode: clear all staff selections
        newSelectedPreferredStaff = [];
      }
      // 'specific' mode: keep current selections as-is

      console.log(`🔧 [MATRIX CONTROLS] Phase 2 - Filter mode change:`, {
        previousMode: prev.preferredStaffFilterMode,
        newMode: mode,
        previousSelections: prev.selectedPreferredStaff.length,
        newSelections: newSelectedPreferredStaff.length,
        autoAdjusted: newSelectedPreferredStaff !== prev.selectedPreferredStaff
      });

      return {
        ...prev,
        preferredStaffFilterMode: mode,
        selectedPreferredStaff: newSelectedPreferredStaff
      };
    });
  }, [availablePreferredStaff]);

  // Handle month range change
  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, []);

  // Phase 2: Enhanced reset with three-mode support
  const handleReset = useCallback(async () => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id),
      monthRange: { start: 0, end: 11 },
      preferredStaffFilterMode: 'all' // Phase 2: Reset to 'all' mode
    });
    
    console.log(`🔄 [MATRIX CONTROLS] Phase 2 - Reset to ALL selections with 'all' mode:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length,
      preferredStaffCount: availablePreferredStaff.length,
      resetMode: 'all',
      phase2ResetComplete: true
    });
  }, [availableSkills, availableClients, availablePreferredStaff]);

  // Manual refresh function with cache invalidation
  const handleManualRefresh = useCallback(async () => {
    try {
      console.log('🔄 [MATRIX CONTROLS] Phase 2 - Manual refresh triggered');
      
      // Trigger cache invalidation and refresh
      await manualCacheRefresh();
      
      // Refetch the preferred staff data
      await refetchPreferredStaff();
      
      console.log('✅ [MATRIX CONTROLS] Phase 2 - Manual refresh completed');
    } catch (error) {
      console.error('❌ [MATRIX CONTROLS] Phase 2 - Manual refresh failed:', error);
    }
  }, [refetchPreferredStaff]);

  // Handle export with Phase 2 enhancements
  const handleExport = useCallback((exportConfig?: {
    format?: 'csv' | 'json';
    includeMetadata?: boolean;
    includeTaskBreakdown?: boolean;
    includePreferredStaffInfo?: boolean;
  }) => {
    // ... keep existing code (export functionality remains the same with Phase 2 metadata)
    if (!filteredData) return;

    const config = {
      format: 'csv' as const,
      includeMetadata: true,
      includeTaskBreakdown: true,
      includePreferredStaffInfo: true,
      ...exportConfig
    };

    // Generate enhanced CSV export with Phase 2 three-mode preferred staff behavior
    const headers = [
      'Skill/Client', 
      'Month', 
      'Demand (Hours)', 
      'Task Count', 
      'Client Count'
    ];

    // Add preferred staff column if enabled and data exists
    if (config.includePreferredStaffInfo && availablePreferredStaff.length > 0) {
      headers.push('Preferred Staff');
    }

    let csvData = headers.join(',') + '\n';
    
    // Add Phase 2 metadata
    if (config.includeMetadata) {
      csvData += `# Export Configuration - Phase 2 THREE-MODE SYSTEM\n`;
      csvData += `# Generated: ${new Date().toISOString()}\n`;
      csvData += `# Grouping Mode: ${groupingMode}\n`;
      csvData += `# Skills Filter: ${isAllSkillsSelected ? 'All' : state.selectedSkills.join(', ')}\n`;
      csvData += `# Clients Filter: ${isAllClientsSelected ? 'All' : availableClients.filter(c => state.selectedClients.includes(c.id)).map(c => c.name).join(', ')}\n`;
      if (availablePreferredStaff.length > 0) {
        csvData += `# Preferred Staff Filter Mode: ${state.preferredStaffFilterMode.toUpperCase()}\n`;
        if (state.preferredStaffFilterMode === 'specific') {
          csvData += `# Selected Preferred Staff: ${availablePreferredStaff.filter(s => state.selectedPreferredStaff.includes(s.id)).map(s => s.name).join(', ')}\n`;
        }
      }
      csvData += `# Month Range: ${filteredData.months[0]?.label} - ${filteredData.months[filteredData.months.length - 1]?.label}\n`;
      csvData += `# Phase 2: THREE-MODE preferred staff filtering implemented\n`;
      csvData += `#\n`;
    }
    
    // ... keep existing code (rest of export logic remains the same)
    if (groupingMode === 'skill') {
      // Export skills - use ALL if all are selected, otherwise use filtered list
      const skillsToExport = isAllSkillsSelected ? availableSkills : state.selectedSkills;
      
      skillsToExport.forEach(skill => {
        filteredData.months.forEach(month => {
          const dataPoint = filteredData.dataPoints.find(
            point => point.skillType === skill && point.month === month.key
          );
          
          if (dataPoint) {
            const row = [
              `"${skill}"`,
              `"${month.label}"`,
              dataPoint.demandHours.toFixed(1),
              dataPoint.taskCount.toString(),
              dataPoint.clientCount.toString()
            ];

            // Add preferred staff info if enabled
            if (config.includePreferredStaffInfo && availablePreferredStaff.length > 0) {
              const preferredStaffInfo = dataPoint.taskBreakdown
                .filter(task => task.preferredStaff?.staffId)
                .map(task => task.preferredStaff?.staffName)
                .filter(Boolean)
                .join('; ');
              row.push(`"${preferredStaffInfo}"`);
            }
            
            csvData += row.join(',') + '\n';
          }
        });
      });
    } else {
      // Export clients - use ALL if all are selected, otherwise use filtered list
      const clientsToExport = isAllClientsSelected ? availableClients : availableClients.filter(client => state.selectedClients.includes(client.id));
      
      clientsToExport.forEach(client => {
        filteredData.months.forEach(month => {
          const monthData = filteredData.dataPoints.find(point => point.month === month.key);
          const clientTasks = monthData?.taskBreakdown.filter(task => task.clientId === client.id) || [];
          const totalHours = clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
          
          const row = [
            `"${client.name}"`,
            `"${month.label}"`,
            totalHours.toFixed(1),
            clientTasks.length.toString(),
            clientTasks.length > 0 ? '1' : '0'
          ];

          // Add preferred staff info if enabled
          if (config.includePreferredStaffInfo && availablePreferredStaff.length > 0) {
            const preferredStaffInfo = clientTasks
              .filter(task => task.preferredStaff?.staffId)
              .map(task => task.preferredStaff?.staffName)
              .filter(Boolean)
              .join('; ');
            row.push(`"${preferredStaffInfo}"`);
          }
          
          csvData += row.join(',') + '\n';
        });
      });
    }
    
    // Download CSV
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demand-matrix-${groupingMode}-phase2-three-mode-${new Date().toISOString().split('T')[0]}.${config.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`📁 [MATRIX CONTROLS] Phase 2 - Enhanced export completed with three-mode metadata:`, {
      format: config.format,
      itemCount: groupingMode === 'skill' ? (isAllSkillsSelected ? availableSkills.length : state.selectedSkills.length) : (isAllClientsSelected ? availableClients.length : state.selectedClients.length),
      monthCount: filteredData.months.length,
      includePreferredStaff: config.includePreferredStaffInfo,
      includeMetadata: config.includeMetadata,
      preferredStaffMode: state.preferredStaffFilterMode,
      dataSource: 'database',
      phase2Enhancement: 'THREE_MODE_EXPORT'
    });
  }, [filteredData, state, groupingMode, availableSkills, availableClients, availablePreferredStaff, isAllSkillsSelected, isAllClientsSelected]);

  return {
    ...state,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    handlePreferredStaffFilterModeChange, // Phase 2: New handler for explicit mode changes
    handleMonthRangeChange,
    handleReset,
    handleExport,
    handleManualRefresh,
    availableSkills,
    availableClients,
    availablePreferredStaff,
    skillsLoading,
    clientsLoading,
    preferredStaffLoading,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    // Phase 2: Return filtered data with three-mode filtering
    filteredData
  };
};
