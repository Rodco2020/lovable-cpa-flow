
import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';

interface UseDemandMatrixControlsProps {
  demandData?: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
}

interface DemandMatrixControlsState {
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[]; // NEW: Add preferred staff state
  monthRange: { start: number; end: number };
}

export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps) => {
  // Initialize state
  const [state, setState] = useState<DemandMatrixControlsState>({
    selectedSkills: [],
    selectedClients: [],
    selectedPreferredStaff: [], // NEW: Initialize preferred staff
    monthRange: { start: 0, end: 11 }
  });

  // Fetch available skills and clients
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Extract available options from demand data and external sources
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

  // FIXED: Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = availableSkills.length > 0 && state.selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = availableClients.length > 0 && state.selectedClients.length === availableClients.length;

  console.log(`🎛️ [MATRIX CONTROLS] Available options:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    selectedSkills: state.selectedSkills.length,
    selectedClients: state.selectedClients.length,
    isAllSkillsSelected,
    isAllClientsSelected
  });

  // Initialize selections when data becomes available - SELECT ALL by default
  useEffect(() => {
    if (demandData && state.selectedSkills.length === 0 && state.selectedClients.length === 0) {
      setState(prev => ({
        ...prev,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id),
        selectedPreferredStaff: [] // NEW: Initialize preferred staff as empty (all selected)
      }));
      
      console.log(`🎛️ [MATRIX CONTROLS] Initialized with ALL skills and clients selected:`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length
      });
    }
  }, [demandData, availableSkills, availableClients]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
      console.log(`🔧 [MATRIX CONTROLS] Skill toggle:`, {
        skill,
        action: prev.selectedSkills.includes(skill) ? 'removed' : 'added',
        newCount: newSelectedSkills.length,
        totalAvailable: availableSkills.length,
        willBeAllSelected: newSelectedSkills.length === availableSkills.length
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

      console.log(`🔧 [MATRIX CONTROLS] Client toggle:`, {
        clientId,
        action: prev.selectedClients.includes(clientId) ? 'removed' : 'added',
        newCount: newSelectedClients.length,
        totalAvailable: availableClients.length,
        willBeAllSelected: newSelectedClients.length === availableClients.length
      });

      return {
        ...prev,
        selectedClients: newSelectedClients
      };
    });
  }, [availableClients.length]);

  // Handle month range change
  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, []);

  // Handle reset - SELECT ALL clients and skills
  const handleReset = useCallback(() => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      selectedPreferredStaff: [], // NEW: Reset preferred staff
      monthRange: { start: 0, end: 11 }
    });
    
    console.log(`🔄 [MATRIX CONTROLS] Reset to ALL skills and clients:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length
    });
  }, [availableSkills, availableClients]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!demandData) return;

    // Generate CSV export for demand data
    const headers = ['Skill/Client', 'Month', 'Demand (Hours)', 'Task Count', 'Client Count'];
    let csvData = headers.join(',') + '\n';
    
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
          
          csvData += row.join(',') + '\n';
        });
      });
    }
    
    // Download CSV
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demand-matrix-${groupingMode}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`📁 [MATRIX CONTROLS] Exported ${groupingMode} data:`, {
      itemCount: groupingMode === 'skill' ? (isAllSkillsSelected ? availableSkills.length : state.selectedSkills.length) : (isAllClientsSelected ? availableClients.length : state.selectedClients.length),
      monthCount: filteredMonths.length
    });
  }, [demandData, state, groupingMode, availableSkills, availableClients, isAllSkillsSelected, isAllClientsSelected]);

  return {
    ...state,
    handleSkillToggle,
    handleClientToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills,
    availableClients,
    skillsLoading,
    clientsLoading,
    isAllSkillsSelected,
    isAllClientsSelected
  };
};
