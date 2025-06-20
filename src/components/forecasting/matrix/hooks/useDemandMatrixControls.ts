
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
}

export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps) => {
  // Initialize state with preferred staff filter
  const [state, setState] = useState<DemandMatrixControlsState>({
    selectedSkills: [],
    selectedClients: [],
    selectedPreferredStaff: [],
    monthRange: { start: 0, end: 11 }
  });

  // Fetch available skills and clients
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Phase 1: Enhanced preferred staff query with validation logging
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

  // Phase 1: Use database-sourced preferred staff with validation
  const availablePreferredStaff = preferredStaffFromDB.map(staff => ({
    id: staff.id,
    name: staff.full_name
  }));

  // Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = availableSkills.length > 0 && state.selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = availableClients.length > 0 && state.selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && state.selectedPreferredStaff.length === availablePreferredStaff.length;

  // Phase 1: Use the enhanced filtering hook with fixed logic
  const filteredData = useDemandMatrixFiltering({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    selectedPreferredStaff: state.selectedPreferredStaff,
    monthRange: state.monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected
  });

  console.log(`🎛️ [MATRIX CONTROLS] Phase 1 FIXED - Enhanced filtering with corrected preferred staff logic:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    availablePreferredStaff: availablePreferredStaff.length,
    selectedSkills: state.selectedSkills.length,
    selectedClients: state.selectedClients.length,
    selectedPreferredStaff: state.selectedPreferredStaff.length,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    filteredDataPoints: filteredData?.dataPoints.length || 0,
    filteringBehavior: isAllPreferredStaffSelected ? 'SHOW_ALL_TASKS_FIXED' : 'FILTER_BY_PREFERRED_STAFF',
    phase1FixApplied: true
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
        selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id)
      }));
      
      console.log(`🎛️ [MATRIX CONTROLS] Phase 1 FIXED - Initialized with ALL selections (showing all tasks with fixed logic):`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        preferredStaffCount: availablePreferredStaff.length,
        phase1InitComplete: true
      });
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff, preferredStaffLoading]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
      console.log(`🔧 [MATRIX CONTROLS] Phase 1 - Skill toggle:`, {
        skill,
        action: prev.selectedSkills.includes(skill) ? 'removed' : 'added',
        newCount: newSelectedSkills.length,
        totalAvailable: availableSkills.length
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

      console.log(`🔧 [MATRIX CONTROLS] Phase 1 - Client toggle:`, {
        clientId,
        action: prev.selectedClients.includes(clientId) ? 'removed' : 'added',
        newCount: newSelectedClients.length,
        totalAvailable: availableClients.length
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

      const willShowAllTasks = newSelectedPreferredStaff.length === availablePreferredStaff.length;

      console.log(`🔧 [MATRIX CONTROLS] Phase 1 FIXED - Preferred staff toggle:`, {
        staffId,
        action: prev.selectedPreferredStaff.includes(staffId) ? 'removed' : 'added',
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        newBehavior: willShowAllTasks ? 'SHOW_ALL_TASKS_FIXED' : 'FILTER_BY_PREFERRED_STAFF',
        phase1FixActive: willShowAllTasks
      });

      return {
        ...prev,
        selectedPreferredStaff: newSelectedPreferredStaff
      };
    });
  }, [availablePreferredStaff.length]);

  // Handle month range change
  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, []);

  // Phase 1: Enhanced reset with validation logging
  const handleReset = useCallback(async () => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id),
      monthRange: { start: 0, end: 11 }
    });
    
    console.log(`🔄 [MATRIX CONTROLS] Phase 1 FIXED - Reset to ALL selections with fixed logic:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length,
      preferredStaffCount: availablePreferredStaff.length,
      resetToShowAllTasks: true,
      phase1FixEnabled: true
    });
  }, [availableSkills, availableClients, availablePreferredStaff]);

  // Phase 3: New manual refresh function with cache invalidation
  const handleManualRefresh = useCallback(async () => {
    try {
      console.log('🔄 [MATRIX CONTROLS] Phase 1 - Manual refresh triggered (Phase 3 feature)');
      
      // Trigger cache invalidation and refresh
      await manualCacheRefresh();
      
      // Refetch the preferred staff data
      await refetchPreferredStaff();
      
      console.log('✅ [MATRIX CONTROLS] Phase 1 - Manual refresh completed');
    } catch (error) {
      console.error('❌ [MATRIX CONTROLS] Phase 1 - Manual refresh failed:', error);
    }
  }, [refetchPreferredStaff]);

  // Handle export
  const handleExport = useCallback((exportConfig?: {
    format?: 'csv' | 'json';
    includeMetadata?: boolean;
    includeTaskBreakdown?: boolean;
    includePreferredStaffInfo?: boolean;
  }) => {
    if (!filteredData) return;

    const config = {
      format: 'csv' as const,
      includeMetadata: true,
      includeTaskBreakdown: true,
      includePreferredStaffInfo: true,
      ...exportConfig
    };

    // Generate enhanced CSV export with Phase 1 fixed preferred staff behavior
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
    
    // Add Phase 1 metadata
    if (config.includeMetadata) {
      csvData += `# Export Configuration - Phase 1 FIXED\n`;
      csvData += `# Generated: ${new Date().toISOString()}\n`;
      csvData += `# Grouping Mode: ${groupingMode}\n`;
      csvData += `# Skills Filter: ${isAllSkillsSelected ? 'All' : state.selectedSkills.join(', ')}\n`;
      csvData += `# Clients Filter: ${isAllClientsSelected ? 'All' : availableClients.filter(c => state.selectedClients.includes(c.id)).map(c => c.name).join(', ')}\n`;
      if (availablePreferredStaff.length > 0) {
        csvData += `# Preferred Staff Filter: ${isAllPreferredStaffSelected ? 'All (showing all tasks - FIXED)' : availablePreferredStaff.filter(s => state.selectedPreferredStaff.includes(s.id)).map(s => s.name).join(', ')}\n`;
        csvData += `# Filtering Behavior: ${isAllPreferredStaffSelected ? 'SHOW_ALL_TASKS_FIXED' : 'FILTER_BY_PREFERRED_STAFF'}\n`;
      }
      csvData += `# Month Range: ${filteredData.months[0]?.label} - ${filteredData.months[filteredData.months.length - 1]?.label}\n`;
      csvData += `# Phase 1: FIXED "All Preferred Staff" behavior implemented\n`;
      csvData += `#\n`;
    }
    
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
    a.download = `demand-matrix-${groupingMode}-phase1-fixed-${new Date().toISOString().split('T')[0]}.${config.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`📁 [MATRIX CONTROLS] Phase 1 FIXED - Enhanced export completed:`, {
      format: config.format,
      itemCount: groupingMode === 'skill' ? (isAllSkillsSelected ? availableSkills.length : state.selectedSkills.length) : (isAllClientsSelected ? availableClients.length : state.selectedClients.length),
      monthCount: filteredData.months.length,
      includePreferredStaff: config.includePreferredStaffInfo,
      includeMetadata: config.includeMetadata,
      preferredStaffBehavior: isAllPreferredStaffSelected ? 'SHOW_ALL_TASKS_FIXED' : 'FILTER_BY_PREFERRED_STAFF',
      dataSource: 'database',
      phase1FixExported: true
    });
  }, [filteredData, state, groupingMode, availableSkills, availableClients, availablePreferredStaff, isAllSkillsSelected, isAllClientsSelected, isAllPreferredStaffSelected]);

  return {
    ...state,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    // Phase 3: Add manual refresh capability
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
    // Phase 1: Return filtered data with fixed logic
    filteredData
  };
};
