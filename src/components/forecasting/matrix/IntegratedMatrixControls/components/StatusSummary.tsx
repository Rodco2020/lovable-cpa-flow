
import React from 'react';

interface StatusSummaryProps {
  groupingMode: 'skill' | 'client';
  monthRange: { start: number; end: number };
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

/**
 * Status summary component
 * Shows current selection state and configuration
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({
  groupingMode,
  monthRange,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  availablePreferredStaff
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="pt-2 border-t">
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Mode: {groupingMode === 'skill' ? 'Skills' : 'Clients'}</div>
        <div>Range: {monthNames[monthRange.start]} - {monthNames[monthRange.end]}</div>
        <div>
          Filters: {isAllSkillsSelected ? 'All skills' : `${selectedSkills.length} skills`}, {' '}
          {isAllClientsSelected ? 'All clients' : `${selectedClients.length} clients`}
          {availablePreferredStaff.length > 0 && (
            <>, {isAllPreferredStaffSelected ? 'All preferred staff' : `${selectedPreferredStaff.length} preferred staff`}</>
          )}
        </div>
      </div>
    </div>
  );
};
