
import React from 'react';
import { Badge } from '@/components/ui/badge';

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
  // Phase 2: Enhanced with filter mode context
  preferredStaffFilterMode?: 'all' | 'specific' | 'none';
}

/**
 * Phase 2: Enhanced SelectionSummary Component
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Added preferredStaffFilterMode context to summary
 * - Enhanced visual indicators for three-mode filter state
 * - Improved summary text to reflect current filter mode
 * - Maintained all existing functionality
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
  selectedPreferredStaff,
  // Phase 2: Default filter mode
  preferredStaffFilterMode = 'all'
}) => {
  const getPreferredStaffSummary = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return `All tasks (${availablePreferredStaff.length} staff available)`;
      case 'specific':
        return selectedPreferredStaff.length > 0 
          ? `${selectedPreferredStaff.length} staff selected`
          : 'No staff selected';
      case 'none':
        return 'Unassigned tasks only';
      default:
        return 'Unknown filter mode';
    }
  };

  const getPreferredStaffBadgeVariant = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return 'secondary';
      case 'specific':
        return selectedPreferredStaff.length > 0 ? 'default' : 'outline';
      case 'none':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  console.log(`📊 [PHASE 2 SUMMARY] SelectionSummary - Rendering with filter mode context:`, {
    preferredStaffFilterMode,
    selectedPreferredStaffCount: selectedPreferredStaff.length,
    availablePreferredStaffCount: availablePreferredStaff.length,
    summaryText: getPreferredStaffSummary()
  });

  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <h4 className="text-xs font-semibold text-gray-600 mb-2">Current Selection</h4>
      <div className="space-y-2 text-xs">
        {/* Time Range */}
        <div className="flex justify-between">
          <span className="text-gray-600">Time Range:</span>
          <span className="font-medium">
            {monthNames[monthRange.start]} - {monthNames[monthRange.end]}
          </span>
        </div>

        {/* Skills */}
        <div className="flex justify-between">
          <span className="text-gray-600">Skills:</span>
          <span className="font-medium">
            {isAllSkillsSelected ? 'All' : `${selectedSkills.length} selected`}
          </span>
        </div>

        {/* Clients */}
        <div className="flex justify-between">
          <span className="text-gray-600">Clients:</span>
          <span className="font-medium">
            {isAllClientsSelected ? 'All' : `${selectedClients.length} selected`}
          </span>
        </div>

        {/* Phase 2: Enhanced Preferred Staff with filter mode context */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Preferred Staff:</span>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getPreferredStaffBadgeVariant()}
              className={`text-xs ${
                preferredStaffFilterMode === 'all' && 'bg-green-100 text-green-800'
              } ${
                preferredStaffFilterMode === 'specific' && 'bg-blue-100 text-blue-800'
              } ${
                preferredStaffFilterMode === 'none' && 'bg-orange-100 text-orange-800'
              }`}
            >
              {preferredStaffFilterMode.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Phase 2: Detailed filter mode description */}
        <div className="pt-1 border-t border-gray-200">
          <span className="text-xs text-gray-500 italic">
            {getPreferredStaffSummary()}
          </span>
        </div>

        {/* Grouping Mode */}
        <div className="flex justify-between">
          <span className="text-gray-600">View:</span>
          <span className="font-medium capitalize">{groupingMode} Matrix</span>
        </div>
      </div>
    </div>
  );
};
