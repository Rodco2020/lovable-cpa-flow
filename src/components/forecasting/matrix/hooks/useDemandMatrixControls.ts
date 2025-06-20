import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useQuery } from '@tanstack/react-query';
import { getPreferredStaffFromDatabase } from '@/services/staff/preferredStaffDataService';

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

  // Phase 1: Use new preferred staff data service with proper caching
  const { data: preferredStaffFromDB = [], isLoading: preferredStaffLoading } = useQuery({
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

  // Phase 1: Use database-sourced preferred staff instead of demand data extraction
  const availablePreferredStaff = preferredStaffFromDB.map(staff => ({
    id: staff.id,
    name: staff.full_name
  }));

  // Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = availableSkills.length > 0 && state.selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = availableClients.length > 0 && state.selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && state.selectedPreferredStaff.length === availablePreferredStaff.length;

  console.log(`🎛️ [MATRIX CONTROLS] Phase 1 - Using database-sourced preferred staff:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    availablePreferredStaff: availablePreferredStaff.length,
    preferredStaffFromDB: preferredStaffFromDB.length,
    selectedSkills: state.selectedSkills.length,
    selectedClients: state.selectedClients.length,
    selectedPreferredStaff: state.selectedPreferredStaff.length,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffLoading
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
      
      console.log(`🎛️ [MATRIX CONTROLS] Phase 1 - Initialized with ALL selections:`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        preferredStaffCount: availablePreferredStaff.length
      });
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff, preferredStaffLoading]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
      console.log(`🔧 [MATRIX CONTROLS] UI Integration - Skill toggle:`, {
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

      console.log(`🔧 [MATRIX CONTROLS] UI Integration - Client toggle:`, {
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

      console.log(`🔧 [MATRIX CONTROLS] Phase 1 - Preferred staff toggle:`, {
        staffId,
        action: prev.selectedPreferredStaff.includes(staffId) ? 'removed' : 'added',
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length
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

  // Handle reset - SELECT ALL clients, skills, and preferred staff
  const handleReset = useCallback(() => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id),
      monthRange: { start: 0, end: 11 }
    });
    
    console.log(`🔄 [MATRIX CONTROLS] Phase 1 - Reset to ALL selections:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length,
      preferredStaffCount: availablePreferredStaff.length
    });
  }, [availableSkills, availableClients, availablePreferredStaff]);

  // Enhanced export with preferred staff context
  const handleExport = useCallback((exportConfig?: {
    format?: 'csv' | 'json';
    includeMetadata?: boolean;
    includeTaskBreakdown?: boolean;
    includePreferredStaffInfo?: boolean;
  }) => {
    if (!demandData) return;

    const config = {
      format: 'csv' as const,
      includeMetadata: true,
      includeTaskBreakdown: true,
      includePreferredStaffInfo: true,
      ...exportConfig
    };

    // Generate enhanced CSV export with preferred staff information
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
    
    // Add metadata if enabled
    if (config.includeMetadata) {
      csvData += `# Export Configuration\n`;
      csvData += `# Generated: ${new Date().toISOString()}\n`;
      csvData += `# Grouping Mode: ${groupingMode}\n`;
      csvData += `# Skills Filter: ${isAllSkillsSelected ? 'All' : state.selectedSkills.join(', ')}\n`;
      csvData += `# Clients Filter: ${isAllClientsSelected ? 'All' : availableClients.filter(c => state.selectedClients.includes(c.id)).map(c => c.name).join(', ')}\n`;
      if (availablePreferredStaff.length > 0) {
        csvData += `# Preferred Staff Filter: ${isAllPreferredStaffSelected ? 'All' : availablePreferredStaff.filter(s => state.selectedPreferredStaff.includes(s.id)).map(s => s.name).join(', ')}\n`;
      }
      csvData += `# Month Range: ${demandData.months[state.monthRange.start]?.label} - ${demandData.months[state.monthRange.end]?.label}\n`;
      csvData += `# Phase 1: Using database-sourced preferred staff data\n`;
      csvData += `#\n`;
    }
    
    const filteredMonths = demandData.months.slice(state.monthRange.start, state.monthRange.end + 1);
    
    if (groupingMode === 'skill') {
      // Export skills - use ALL if all are selected, otherwise use filtered list
      const skillsToExport = isAllSkillsSelected ? availableSkills : state.selectedSkills;
      
      skillsToExport.forEach(skill => {
        filteredMonths.forEach(month => {
          const dataPoint = demandData.dataPoints.find(
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
        filteredMonths.forEach(month => {
          const monthData = demandData.dataPoints.find(point => point.month === month.key);
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
    a.download = `demand-matrix-${groupingMode}-phase1-${new Date().toISOString().split('T')[0]}.${config.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`📁 [MATRIX CONTROLS] Phase 1 - Enhanced export completed:`, {
      format: config.format,
      itemCount: groupingMode === 'skill' ? (isAllSkillsSelected ? availableSkills.length : state.selectedSkills.length) : (isAllClientsSelected ? availableClients.length : state.selectedClients.length),
      monthCount: filteredMonths.length,
      includePreferredStaff: config.includePreferredStaffInfo,
      includeMetadata: config.includeMetadata,
      preferredStaffSource: 'database'
    });
  }, [demandData, state, groupingMode, availableSkills, availableClients, availablePreferredStaff, isAllSkillsSelected, isAllClientsSelected, isAllPreferredStaffSelected]);

  return {
    ...state,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills,
    availableClients,
    availablePreferredStaff,
    skillsLoading,
    clientsLoading,
    preferredStaffLoading,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected
  };
};
