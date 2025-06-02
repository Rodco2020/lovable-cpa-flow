
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DebuggerHeader from './ForecastSkillDebugger/components/DebuggerHeader';
import SkillDistributionPanel from './ForecastSkillDebugger/components/SkillDistributionPanel';
import StaffSkillsTable from './ForecastSkillDebugger/components/StaffSkillsTable';
import { useStaffSkillDebugger } from './ForecastSkillDebugger/hooks/useStaffSkillDebugger';

/**
 * ForecastSkillDebugger Component
 * 
 * This component provides debugging and analysis tools for staff skill mapping
 * in the forecasting system. It shows how staff skills are mapped to standard
 * forecast skill types (Junior Staff, Senior Staff, CPA) and provides insights
 * into the skill distribution across the organization.
 * 
 * Features:
 * - Displays staff skill mapping analysis
 * - Shows skill type distribution statistics
 * - Identifies staff who defaulted to Junior level
 * - Provides refresh functionality for real-time analysis
 */
const ForecastSkillDebugger: React.FC = () => {
  const { 
    staffSkills, 
    skillCounts, 
    loading, 
    error, 
    loadStaffSkills 
  } = useStaffSkillDebugger();

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <DebuggerHeader 
        onRefresh={loadStaffSkills}
        loading={loading}
      />
      
      <div className="flex gap-4 mb-4">
        <SkillDistributionPanel skillCounts={skillCounts} />
      </div>
      
      <StaffSkillsTable 
        staffSkills={staffSkills}
        loading={loading}
      />
    </div>
  );
};

export default ForecastSkillDebugger;
