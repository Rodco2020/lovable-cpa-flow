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
  selectedPreferredStaff: string[];
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
    selectedPreferredStaff: [],
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

  // Enhanced: Extract available preferred staff from demand data
  const availablePreferredStaff = Array.from(new Set(
    demandData?.dataPoints.flatMap(point => 
      point.taskBreakdown
        .filter(task => task.preferredStaffId && task.preferredStaffName)
        .map(task => ({
          id: task.preferredStaffId!,
          name: task.preferredStaffName!
        }))
    ) || []
  ));

  // Enhanced: Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = availableSkills.length > 0 && state.selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = availableClients.length > 0 && state.selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = availablePreferredStaff.length > 0 && state.selectedPreferredStaff.length === availablePreferredStaff.length;

  console.log(`🎛️ [MATRIX CONTROLS] Available options:`, {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    availablePreferredStaff: availablePreferredStaff.length,
    selectedSkills: state.selectedSkills.length,
    selectedClients: state.selectedClients.length,
    selectedPreferredStaff: state.selectedPreferredStaff.length,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected
  });

  // Initialize selections when data becomes available - SELECT ALL by default
  useEffect(() => {
    if (demandData && state.selectedSkills.length === 0 && state.selectedClients.length === 0 && state.selectedPreferredStaff.length === 0) {
      setState(prev => ({
        ...prev,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id),
        selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id)
      }));
      
      console.log(`🎛️ [MATRIX CONTROLS] Initialized with ALL skills, clients, and staff selected:`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        staffCount: availablePreferredStaff.length
      });
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff]);

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

  // Enhanced: Handle preferred staff toggle
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setState(prev => {
      const newSelectedPreferredStaff = prev.selectedPreferredStaff.includes(staffId)
        ? prev.selectedPreferredStaff.filter(s => s !== staffId)
        : [...prev.selectedPreferredStaff, staffId];

      console.log(`🔧 [MATRIX CONTROLS] Preferred staff toggle:`, {
        staffId,
        action: prev.selectedPreferredStaff.includes(staffId) ? 'removed' : 'added',
        newCount: newSelectedPreferredStaff.length,
        totalAvailable: availablePreferredStaff.length,
        willBeAllSelected: newSelectedPreferredStaff.length === availablePreferredStaff.length
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

  // Enhanced: Handle reset - SELECT ALL clients, skills, and staff
  const handleReset = useCallback(() => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      selectedPreferredStaff: availablePreferredStaff.map(staff => staff.id),
      monthRange: { start: 0, end: 11 }
    });
    
    console.log(`🔄 [MATRIX CONTROLS] Reset to ALL skills, clients, and staff:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length,
      staffCount: availablePreferredStaff.length
    });
  }, [availableSkills, availableClients, availablePreferredStaff]);

  // Enhanced export with staff filtering
  const handleExport = useCallback(() => {
    if (!demandData) return;

    // Enhanced CSV headers to include staff information
    const headers = groupingMode === 'skill' 
      ? ['Skill/Client', 'Month', 'Demand (Hours)', 'Task Count', 'Client Count', 'Preferred Staff', 'Staff Hours']
      : ['Client', 'Month', 'Demand (Hours)', 'Task Count', 'Preferred Staff', 'Staff Hours'];
    
    let csvData = headers.join(',') + '\n';
    
    const filteredMonths = demandData.months.slice(state.monthRange.start, state.monthRange.end + 1);
    
    if (groupingMode === 'skill') {
      const skillsToExport = isAllSkillsSelected ? availableSkills : state.selectedSkills;
      const staffToExport = isAllPreferredStaffSelected ? availablePreferredStaff.map(s => s.id) : state.selectedPreferredStaff;
      
      skillsToExport.forEach(skill => {
        filteredMonths.forEach(month => {
          const dataPoint = demandData.dataPoints.find(
            point => point.skillType === skill && point.month === month.key
          );
          
          if (dataPoint) {
            // Filter tasks by selected staff
            const filteredTasks = dataPoint.taskBreakdown?.filter(task => 
              !task.preferredStaffId || staffToExport.length === 0 || staffToExport.includes(task.preferredStaffId)
            ) || [];
            
            const staffHours = filteredTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
            const staffNames = Array.from(new Set(
              filteredTasks
                .filter(task => task.preferredStaffName)
                .map(task => task.preferredStaffName!)
            )).join('; ');
            
            const row = [
              `"${skill}"`,
              `"${month.label}"`,
              staffHours.toFixed(1),
              filteredTasks.length.toString(),
              new Set(filteredTasks.map(task => task.clientId)).size.toString(),
              `"${staffNames || 'Unassigned'}"`,
              staffHours.toFixed(1)
            ];
            
            csvData += row.join(',') + '\n';
          }
        });
      });
    } else {
      const clientsToExport = isAllClientsSelected ? availableClients : availableClients.filter(client => state.selectedClients.includes(client.id));
      const staffToExport = isAllPreferredStaffSelected ? availablePreferredStaff.map(s => s.id) : state.selectedPreferredStaff;
      
      clientsToExport.forEach(client => {
        filteredMonths.forEach(month => {
          const monthData = demandData.dataPoints.find(point => point.month === month.key);
          const clientTasks = monthData?.taskBreakdown.filter(task => 
            task.clientId === client.id && 
            (!task.preferredStaffId || staffToExport.length === 0 || staffToExport.includes(task.preferredStaffId))
          ) || [];
          
          const totalHours = clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
          const staffNames = Array.from(new Set(
            clientTasks
              .filter(task => task.preferredStaffName)
              .map(task => task.preferredStaffName!)
          )).join('; ');
          
          const row = [
            `"${client.name}"`,
            `"${month.label}"`,
            totalHours.toFixed(1),
            clientTasks.length.toString(),
            `"${staffNames || 'Unassigned'}"`,
            totalHours.toFixed(1)
          ];
          
          csvData += row.join(',') + '\n';
        });
      });
    }
    
    // Download CSV with enhanced filename
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const staffFilterSuffix = isAllPreferredStaffSelected ? 'all-staff' : `${state.selectedPreferredStaff.length}-staff`;
    a.download = `demand-matrix-${groupingMode}-${staffFilterSuffix}-${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`📁 [MATRIX CONTROLS] Enhanced export with staff filtering:`, {
      itemCount: groupingMode === 'skill' ? (isAllSkillsSelected ? availableSkills.length : state.selectedSkills.length) : (isAllClientsSelected ? availableClients.length : state.selectedClients.length),
      monthCount: filteredMonths.length,
      staffFilterEnabled: !isAllPreferredStaffSelected,
      staffCount: isAllPreferredStaffSelected ? availablePreferredStaff.length : state.selectedPreferredStaff.length
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
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected
  };
};
