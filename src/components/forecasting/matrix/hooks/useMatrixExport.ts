
import { useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

interface UseMatrixExportProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: SkillType[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
}

/**
 * Hook for managing matrix export functionality
 * 
 * Handles CSV export generation for demand matrix data with proper filtering
 * and grouping based on the current view mode and selections.
 */
export const useMatrixExport = ({
  demandData,
  selectedSkills,
  selectedClients,
  monthRange,
  groupingMode,
  availableSkills,
  availableClients,
  isAllSkillsSelected,
  isAllClientsSelected
}: UseMatrixExportProps) => {
  
  const handleExport = useCallback(() => {
    if (!demandData) return;

    // Generate CSV export for demand data
    const headers = ['Skill/Client', 'Month', 'Demand (Hours)', 'Task Count', 'Client Count'];
    let csvData = headers.join(',') + '\n';
    
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    
    if (groupingMode === 'skill') {
      // Export skills - use ALL if all are selected, otherwise use filtered list
      const skillsToExport = isAllSkillsSelected ? availableSkills : selectedSkills;
      
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
      const clientsToExport = isAllClientsSelected ? availableClients : availableClients.filter(client => selectedClients.includes(client.id));
      
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
    
    console.log(`📁 [MATRIX EXPORT] Exported ${groupingMode} data:`, {
      itemCount: groupingMode === 'skill' ? (isAllSkillsSelected ? availableSkills.length : selectedSkills.length) : (isAllClientsSelected ? availableClients.length : selectedClients.length),
      monthCount: filteredMonths.length
    });
  }, [
    demandData, 
    selectedSkills, 
    selectedClients, 
    monthRange, 
    groupingMode, 
    availableSkills, 
    availableClients, 
    isAllSkillsSelected, 
    isAllClientsSelected
  ]);

  return {
    handleExport
  };
};
