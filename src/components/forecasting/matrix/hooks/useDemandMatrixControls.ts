
import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { useDemandData } from '@/services/forecasting/demand/dataFetcher/useDemandData';
import { EnhancedDataService } from '@/services/forecasting/demand/dataFetcher/enhancedDataService';

interface UseDemandMatrixControlsProps {
  groupingMode: 'skill' | 'client';
  enablePreferredStaffFiltering?: boolean;
}

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

  // FIXED: Use correct hook interface
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

  // Enhanced data availability debugging
  useEffect(() => {
    if (demandData) {
      console.log('📊 [PHASE 2 MATRIX CONTROLS] Enhanced data received:', {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        staffCount: availablePreferredStaff.length,
        dataPointsCount: demandData.dataPoints?.length || 0,
        totalDemand: demandData.totalDemand,
        skillTypes: availableSkills.slice(0, 5)
      });

      // Enhanced data validation with skill resolution
      const validation = EnhancedDataService.validateDataAvailability({
        clients: availableClients,
        staff: availablePreferredStaff,
        skills: availableSkills,
        recurringTasks: demandData.dataPoints || []
      });
      
      if (!validation.isValid) {
        console.warn('⚠️ [PHASE 2 MATRIX CONTROLS] Enhanced data validation issues:', validation.issues);
      } else {
        console.log('✅ [PHASE 2 MATRIX CONTROLS] Data validation passed successfully');
      }
    }
  }, [demandData, availableSkills, availableClients, availablePreferredStaff]);

  // Enhanced debug info generation when no data is available
  useEffect(() => {
    if (!isLoading && (!demandData || demandData.dataPoints?.length === 0)) {
      console.log('🔧 [PHASE 2 MATRIX CONTROLS] No demand data available, generating enhanced debug info...');
      
      EnhancedDataService.generateDebugInfo().then(debugInfo => {
        console.log('🔧 [PHASE 2 MATRIX CONTROLS] Enhanced debug information:', debugInfo);
        
        if (!debugInfo.databaseConnection) {
          console.error('❌ [PHASE 2 MATRIX CONTROLS] Database connection failed');
        } else if (Object.values(debugInfo.tableData).every(count => count === 0)) {
          console.warn('⚠️ [PHASE 2 MATRIX CONTROLS] All tables appear to be empty');
        } else if (debugInfo.skillResolutionStatus && !debugInfo.skillResolutionStatus.initialized) {
          console.error('❌ [PHASE 2 MATRIX CONTROLS] Skill resolution service failed to initialize:', debugInfo.skillResolutionStatus.error);
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
    if (mode === 'all' || mode === 'none') {
      setSelectedPreferredStaff([]);
    }
  }, []);

  const handleMonthRangeChange = useCallback((range: { start: number; end: number }) => {
    setMonthRange(range);
  }, []);

  const handleExport = useCallback(() => {
    console.log('📤 [PHASE 2 MATRIX CONTROLS] Export functionality triggered');
  }, []);

  const handleReset = useCallback(() => {
    console.log('🔄 [PHASE 2 MATRIX CONTROLS] Resetting all filters');
    setSelectedSkills([]);
    setSelectedClients([]);
    setSelectedPreferredStaff([]);
    setPreferredStaffFilterMode('all');
    setMonthRange({ start: 0, end: 11 });
  }, []);

  console.log(`🎛️ [PHASE 2 MATRIX CONTROLS] Enhanced current state:`, {
    groupingMode,
    monthRange,
    selectedSkillsCount: selectedSkills.length,
    selectedClientsCount: selectedClients.length,
    selectedStaffCount: selectedPreferredStaff.length,
    preferredStaffFilterMode,
    isLoading,
    hasData: !!demandData,
    dataPointsCount: demandData?.dataPoints?.length || 0,
    skillResolutionActive: true
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
