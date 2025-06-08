
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
    monthRange: { start: 0, end: 11 }
  });

  // Fetch available skills and clients
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Extract available options from demand data and external sources
  const availableSkills = demandData?.skills || [];
  const availableClients = Array.from(new Set(
    demandData?.dataPoints.flatMap(point => 
      point.taskBreakdown.map(task => ({
        id: task.clientId,
        name: task.clientName
      }))
    ) || []
  ));

  // Initialize selections when data becomes available
  useEffect(() => {
    if (demandData && state.selectedSkills.length === 0 && state.selectedClients.length === 0) {
      setState(prev => ({
        ...prev,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id)
      }));
    }
  }, [demandData, availableSkills, availableClients]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  }, []);

  // Handle client toggle
  const handleClientToggle = useCallback((clientId: string) => {
    setState(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(c => c !== clientId)
        : [...prev.selectedClients, clientId]
    }));
  }, []);

  // Handle month range change
  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 }
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
      const filteredSkills = availableSkills.filter(skill => state.selectedSkills.includes(skill));
      
      filteredSkills.forEach(skill => {
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
      // Client-based export
      const filteredClients = availableClients.filter(client => state.selectedClients.includes(client.id));
      
      filteredClients.forEach(client => {
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
  }, [demandData, state, groupingMode, availableSkills, availableClients]);

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
    clientsLoading
  };
};
