
import { useState, useEffect } from 'react';
import { StaffSkillAnalysisService } from '../services/staffSkillAnalysisService';
import { SkillCountUtils } from '../utils/skillCountUtils';
import { SkillDebuggerState, SkillCounts } from '../types';

export const useStaffSkillDebugger = () => {
  const [state, setState] = useState<SkillDebuggerState>({
    staffSkills: [],
    loading: false,
    error: null
  });

  const loadStaffSkills = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const skillAnalysis = await StaffSkillAnalysisService.loadAllStaffSkills();
      setState(prev => ({ 
        ...prev, 
        staffSkills: skillAnalysis, 
        loading: false 
      }));
    } catch (err) {
      console.error("Failed to load staff skills:", err);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to load staff skills. Check console for details.", 
        loading: false 
      }));
    }
  };

  // Load staff skills on first render
  useEffect(() => {
    loadStaffSkills();
  }, []);

  // Calculate skill counts
  const skillCounts: SkillCounts = SkillCountUtils.calculateSkillCounts(state.staffSkills);

  return {
    ...state,
    skillCounts,
    loadStaffSkills
  };
};
