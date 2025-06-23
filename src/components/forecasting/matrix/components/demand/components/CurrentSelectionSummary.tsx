
import React from 'react';
import { getMonthNames, isAllItemsSelected } from './utils/selectionUtils';

interface CurrentSelectionSummaryProps {
  groupingMode: 'skill' | 'client';
  monthRange: { start: number; end: number };
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

/**
 * Current Selection Summary Component
 * Displays a summary of current filter selections and settings
 */
export const CurrentSelectionSummary: React.FC<CurrentSelectionSummaryProps> = ({
  groupingMode,
  monthRange,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  availableSkills,
  availableClients,
  availablePreferredStaff
}) => {
  const monthNames = getMonthNames();
  const isAllSkillsSelected = isAllItemsSelected(selectedSkills, availableSkills);
  const isAllClientsSelected = isAllItemsSelected(selectedClients, availableClients);
  const isAllPreferredStaffSelected = isAllItemsSelected(selectedPreferredStaff, availablePreferredStaff);

  return (
    <div className="pt-2 border-t">
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Mode: {groupingMode === 'skill' ? 'Skills' : 'Clients'}</div>
        <div>Range: {monthNames[monthRange.start]} - {monthNames[monthRange.end]}</div>
        <div>
          Filters: {isAllSkillsSelected ? 'All skills' : `${selectedSkills.length} skills`}, {' '}
          {isAllClientsSelected ? 'All clients' : `${selectedClients.length} clients`}, {' '}
          {isAllPreferredStaffSelected ? 'All staff' : `${selectedPreferredStaff.length} staff`}
        </div>
      </div>
    </div>
  );
};
