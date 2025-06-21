
import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { useDemandData } from '@/services/forecasting/demand/dataFetcher/useDemandData';
import { EnhancedDataService } from '@/services/forecasting/demand/dataFetcher/enhancedDataService';

interface UseDemandMatrixControlsProps {
  groupingMode: 'skill' | 'client';
  enablePreferredStaffFiltering?: boolean;
}

/**
 * Enhanced Demand Matrix Controls Hook
 * 
 * This hook now connects to real Supabase data instead of mock data,
 * providing actual clients, staff, and skills for filtering.
 */
export const useDemandMatrixControls = ({
  groupingMode,
  enablePreferredStaffFiltering = true
}: UseDemandMatrixControlsProps) => {
  // State management
  const [monthRange, setMonthRange] = useState({ start: 0, end: 11 });
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedPreferredStaff, setSelectedPreferredStaff] = useState<string[]>([]);
  const [preferredStaffFilterMode, setPreferredStaffFilterMode] = useState<'all' | 'specific' | 'none'>('all');

  // Fetch demand data using the enhanced hook
  const {
    data: demandData,
    isLoading,
    error,
    refetch
  } = useDemandData({
    monthRange,
    selectedSkills
  });

  // Extract available options from the fetched data
  const availableSkills = demandData?.skills || [];
  const availableClients = demandData?.availableClients || [];
  const availablePreferredStaff = demandData?.availablePreferredStaff || [];

  // Calculate selection states
  const isAllSkillsSelected = selectedSkills.length === 0 || selectedSkills.length === availableSkills.length;
  const isAllClientsSelected = selectedClients.length === 0 || selectedClients.length === availableClients.length;
  const isAllPreferredStaffSelected = selectedPreferredStaff.length === 0 || selectedPreferredStaff.length === availablePreferredStaff.length;

  // Debug data availability
  useEffect(() => {
    if (demandData) {
      console.log('📊 [MATRIX CONTROLS] Data received:', {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        staffCount: availablePreferredStaff.length,
        dataPointsCount: demandData.dataPoints?.length || 0,
        totalDemand: demandData.totalDemand
      });

      // Run data validation (this is synchronous, not async)
      const validation = EnhancedDataService.validateDataAvailability({
        clients: availableClients,
        staff: availablePreferredStaff,
        skills: availableSkills,
        recurringTasks: demandData.dataPoints || []
      });
      
      if (!validation.isValid) {
        console.warn('⚠️ [MATRIX CONTROLS] Data validation issues:', validation.issues);
      }
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff]);

  // Generate debug info when no data is available
  useEffect(() => {
    if (!isLoading && (!demandData || demandData.dataPoints?.length === 0)) {
      console.log('🔧 [MATRIX CONTROLS] No demand data available, generating debug info...');
      
      EnhancedDataService.generateDebugInfo().then(debugInfo => {
        console.log('🔧 [MATRIX CONTROLS] Debug information:', debugInfo);
        
        if (!debugInfo.databaseConnection) {
          console.error('❌ [MATRIX CONTROLS] Database connection failed');
        } else if (Object.values(debugInfo.tableData).every(count => count === 0)) {
          console.warn('⚠️ [MATRIX CONTROLS] All tables appear to be empty');
        }
      });
    }
  }, [isLoading, demandData]);

  // Event handlers
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  }, []);

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  }, []);

  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setSelectedPreferredStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  }, []);

  const handlePreferredStaffFilterModeChange = useCallback((mode: 'all' | 'specific' | 'none') => {
    setPreferredStaffFilterMode(mode);
    // Reset selected staff when changing modes
    if (mode === 'all' || mode === 'none') {
      setSelectedPreferredStaff([]);
    }
  }, []);

  const handleMonthRangeChange = useCallback((range: { start: number; end: number }) => {
    setMonthRange(range);
  }, []);

  const handleExport = useCallback(() => {
    console.log('📤 [MATRIX CONTROLS] Export functionality triggered');
    // Export logic will be implemented separately
  }, []);

  const handleReset = useCallback(() => {
    console.log('🔄 [MATRIX CONTROLS] Resetting all filters');
    setSelectedSkills([]);
    setSelectedClients([]);
    setSelectedPreferredStaff([]);
    setPreferredStaffFilterMode('all');
    setMonthRange({ start: 0, end: 11 });
  }, []);

  console.log(`🎛️ [MATRIX CONTROLS] Current state:`, {
    groupingMode,
    monthRange,
    selectedSkillsCount: selectedSkills.length,
    selectedClientsCount: selectedClients.length,
    selectedStaffCount: selectedPreferredStaff.length,
    preferredStaffFilterMode,
    isLoading,
    hasData: !!demandData,
    dataPointsCount: demandData?.dataPoints?.length || 0
  });

  return {
    // Data
    demandData,
    isLoading,
    error,
    
    // Available options
    availableSkills,
    availableClients,
    availablePreferredStaff,
    
    // Current selections
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    preferredStaffFilterMode,
    
    // Selection states
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    
    // Event handlers
    onSkillToggle: handleSkillToggle,
    onClientToggle: handleClientToggle,
    onPreferredStaffToggle: handlePreferredStaffToggle,
    onPreferredStaffFilterModeChange: handlePreferredStaffFilterModeChange,
    onMonthRangeChange: handleMonthRangeChange,
    onExport: handleExport,
    onReset: handleReset,
    onRefresh: refetch
  };
};
