
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';

interface PreferredStaffOption {
  id: string;
  name: string;
}

interface PreferredStaffFilterSectionProps {
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: PreferredStaffOption[];
  preferredStaffLoading: boolean;
  preferredStaffError: string | null;
  isAllPreferredStaffSelected: boolean;
  onRetryPreferredStaff?: () => void;
}

/**
 * Preferred Staff Filter Section Component
 * 
 * Phase 2 implementation following existing design patterns from Skills and Clients filters.
 * Includes proper loading states, error handling, accessibility, and responsive design.
 */
export const PreferredStaffFilterSection: React.FC<PreferredStaffFilterSectionProps> = ({
  selectedPreferredStaff,
  onPreferredStaffToggle,
  availablePreferredStaff,
  preferredStaffLoading,
  preferredStaffError,
  isAllPreferredStaffSelected,
  onRetryPreferredStaff
}) => {
  const handleSelectAllPreferredStaff = () => {
    if (isAllPreferredStaffSelected) {
      // Deselect all
      availablePreferredStaff.forEach(staff => onPreferredStaffToggle(staff.id));
    } else {
      // Select all
      availablePreferredStaff
        .filter(staff => !selectedPreferredStaff.includes(staff.id))
        .forEach(staff => onPreferredStaffToggle(staff.id));
    }
  };

  return (
    <div>
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <label 
            className="text-sm font-medium"
            id="preferred-staff-label"
          >
            Preferred Staff
          </label>
          {preferredStaffLoading && (
            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {preferredStaffError && onRetryPreferredStaff && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRetryPreferredStaff}
              className="text-xs h-auto p-1"
              aria-label="Retry loading preferred staff"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          <Button 
            onClick={handleSelectAllPreferredStaff}
            variant="ghost" 
            size="sm"
            className="text-xs"
            disabled={preferredStaffLoading || availablePreferredStaff.length === 0}
            aria-label={isAllPreferredStaffSelected ? 'Deselect all preferred staff' : 'Select all preferred staff'}
          >
            {isAllPreferredStaffSelected ? 'None' : 'All'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {preferredStaffError && (
        <div 
          className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2 mb-2"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>Failed to load preferred staff: {preferredStaffError}</span>
        </div>
      )}

      {/* Loading State */}
      {preferredStaffLoading && (
        <div className="space-y-2 mb-2" aria-live="polite" aria-label="Loading preferred staff">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded flex-1" />
            </div>
          ))}
        </div>
      )}

      {/* Staff List */}
      {!preferredStaffLoading && !preferredStaffError && (
        <div 
          className="space-y-2 max-h-32 overflow-y-auto"
          role="group"
          aria-labelledby="preferred-staff-label"
        >
          {availablePreferredStaff.length === 0 ? (
            <div className="text-xs text-muted-foreground italic p-2 text-center">
              No preferred staff available. Add staff members in the Staff module.
            </div>
          ) : (
            availablePreferredStaff.map((staff) => (
              <div key={staff.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`preferred-staff-${staff.id}`}
                  checked={selectedPreferredStaff.includes(staff.id)}
                  onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                  aria-describedby={`preferred-staff-${staff.id}-name`}
                />
                <label
                  htmlFor={`preferred-staff-${staff.id}`}
                  id={`preferred-staff-${staff.id}-name`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={staff.name}
                >
                  {staff.name}
                </label>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selection Summary */}
      {!preferredStaffLoading && (
        <div className="flex flex-wrap gap-1 mt-2">
          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {selectedPreferredStaff.length} of {availablePreferredStaff.length} selected
          </div>
          {availablePreferredStaff.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
              Active Staff
            </div>
          )}
        </div>
      )}
    </div>
  );
};
