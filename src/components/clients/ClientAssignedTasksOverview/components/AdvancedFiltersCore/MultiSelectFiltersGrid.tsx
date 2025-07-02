
import React from 'react';
import { MultiSelectFilter } from './MultiSelectFilter';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';

interface MultiSelectFiltersGridProps {
  skillFilters: string[];
  clientFilters: string[];
  priorityFilters: string[];
  statusFilters: string[];
  staffLiaisonFilters: string[];
  preferredStaffFilters: string[];
  validSkills: string[];
  validClients: Client[];
  validPriorities: string[];
  validStaffOptions: StaffOption[];
  onUpdateFilter: (
    filterKey: 'skillFilters' | 'clientFilters' | 'priorityFilters' | 'statusFilters' | 'staffLiaisonFilters' | 'preferredStaffFilters',
    value: string,
    checked: boolean
  ) => void;
}

/**
 * Multi Select Filters Grid Component
 * Contains all the multi-select filter components in a grid layout
 */
export const MultiSelectFiltersGrid: React.FC<MultiSelectFiltersGridProps> = ({
  skillFilters,
  clientFilters,
  priorityFilters,
  statusFilters,
  staffLiaisonFilters,
  preferredStaffFilters,
  validSkills,
  validClients,
  validPriorities,
  validStaffOptions,
  onUpdateFilter
}) => {
  const skillOptions = validSkills.map(skill => ({ value: skill, label: skill }));
  const clientOptions = validClients.map(client => ({ value: client.id, label: client.legalName }));
  const priorityOptions = validPriorities.map(priority => ({ value: priority, label: priority }));
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'recurring', label: 'Recurring' },
    { value: 'adhoc', label: 'Ad-hoc' }
  ];
  const staffOptions = [
    { value: 'no-staff', label: 'No Staff Assigned' },
    ...validStaffOptions.map(staff => ({ value: staff.id, label: staff.full_name }))
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Skills Filter */}
      <MultiSelectFilter
        title="Skills"
        selectedValues={skillFilters}
        availableOptions={skillOptions}
        placeholder="Add skill..."
        onValueAdd={(value) => onUpdateFilter('skillFilters', value, true)}
        onValueRemove={(value) => onUpdateFilter('skillFilters', value, false)}
        showCount={true}
      />

      {/* Clients Filter */}
      <MultiSelectFilter
        title="Clients"
        selectedValues={clientFilters}
        availableOptions={clientOptions}
        placeholder="Add client..."
        onValueAdd={(value) => onUpdateFilter('clientFilters', value, true)}
        onValueRemove={(value) => onUpdateFilter('clientFilters', value, false)}
      />

      {/* Priority Filter */}
      <MultiSelectFilter
        title="Priority"
        selectedValues={priorityFilters}
        availableOptions={priorityOptions}
        placeholder="Add priority..."
        onValueAdd={(value) => onUpdateFilter('priorityFilters', value, true)}
        onValueRemove={(value) => onUpdateFilter('priorityFilters', value, false)}
      />

      {/* Status Filter */}
      <MultiSelectFilter
        title="Status"
        selectedValues={statusFilters}
        availableOptions={statusOptions}
        placeholder="Add status..."
        onValueAdd={(value) => onUpdateFilter('statusFilters', value, true)}
        onValueRemove={(value) => onUpdateFilter('statusFilters', value, false)}
      />

      {/* Staff Liaison Filter */}
      <MultiSelectFilter
        title="Staff Liaison"
        selectedValues={staffLiaisonFilters}
        availableOptions={staffOptions}
        placeholder="Add staff..."
        onValueAdd={(value) => onUpdateFilter('staffLiaisonFilters', value, true)}
        onValueRemove={(value) => onUpdateFilter('staffLiaisonFilters', value, false)}
      />

      {/* Preferred Staff Filter */}
      <MultiSelectFilter
        title="Preferred Staff"
        selectedValues={preferredStaffFilters}
        availableOptions={staffOptions}
        placeholder="Add staff..."
        onValueAdd={(value) => onUpdateFilter('preferredStaffFilters', value, true)}
        onValueRemove={(value) => onUpdateFilter('preferredStaffFilters', value, false)}
      />
    </div>
  );
};
