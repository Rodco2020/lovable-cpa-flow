
import React from 'react';

interface SelectionSummaryProps {
  groupingMode: 'skill' | 'client';
  monthRange: { start: number; end: number };
  monthNames: string[];
  isAllSkillsSelected: boolean;
  selectedSkills: string[];
  isAllClientsSelected: boolean;
  selectedClients: string[];
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllPreferredStaffSelected: boolean;
  selectedPreferredStaff: string[];
}

/**
 * Selection Summary Component
 * Displays current filter selections and mode
 */
export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  groupingMode,
  monthRange,
  monthNames,
  isAllSkillsSelected,
  selectedSkills,
  isAllClientsSelected,
  selectedClients,
  availablePreferredStaff,
  isAllPreferredStaffSelected,
  selectedPreferredStaff
}) => {
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
