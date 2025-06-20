
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw,
  Users,
  CheckCircle,
  Target,
  UserX,
  Globe
} from 'lucide-react';

interface ThreeModePreferredStaffFilterProps {
  availablePreferredStaff: Array<{ id: string; name: string }>;
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  preferredStaffLoading?: boolean;
  className?: string;
}

/**
 * Phase 2: Three-Mode Preferred Staff Filter Component
 * 
 * This component provides a dedicated interface for the new three-mode preferred staff filtering system:
 * - 'all' mode: Shows all tasks regardless of preferred staff assignment
 * - 'specific' mode: Shows only tasks assigned to selected preferred staff
 * - 'none' mode: Shows only tasks without preferred staff assignments
 */
export const ThreeModePreferredStaffFilter: React.FC<ThreeModePreferredStaffFilterProps> = ({
  availablePreferredStaff,
  selectedPreferredStaff,
  onPreferredStaffToggle,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  preferredStaffLoading = false,
  className
}) => {
  // Helper function to get mode description
  const getModeDescription = (mode: 'all' | 'specific' | 'none') => {
    switch (mode) {
      case 'all':
        return 'Showing ALL tasks (with and without preferred staff)';
      case 'specific':
        return `Showing tasks for ${selectedPreferredStaff.length} selected staff member${selectedPreferredStaff.length !== 1 ? 's' : ''}`;
      case 'none':
        return 'Showing only tasks WITHOUT preferred staff assignments';
      default:
        return 'Unknown mode';
    }
  };

  // Helper function to get mode icon
  const getModeIcon = (mode: 'all' | 'specific' | 'none') => {
    switch (mode) {
      case 'all':
        return <Globe className="h-4 w-4 text-green-600" />;
      case 'specific':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'none':
        return <UserX className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  console.log(`👥 [THREE-MODE FILTER] Phase 2 - Rendering three-mode preferred staff filter:`, {
    availableCount: availablePreferredStaff.length,
    selectedCount: selectedPreferredStaff.length,
    currentMode: preferredStaffFilterMode,
    isAllSelected: isAllPreferredStaffSelected,
    loading: preferredStaffLoading
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Preferred Staff Filter
          <Badge variant="secondary" className="flex items-center gap-1">
            {getModeIcon(preferredStaffFilterMode)}
            {preferredStaffFilterMode.toUpperCase()}
          </Badge>
          {preferredStaffLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          )}
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {preferredStaffLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading preferred staff...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter Mode Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Filter Mode</Label>
              <RadioGroup
                value={preferredStaffFilterMode}
                onValueChange={onPreferredStaffFilterModeChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="all" id="mode-all" />
                  <Label htmlFor="mode-all" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Globe className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">All Tasks</div>
                      <div className="text-xs text-gray-500">Show all tasks regardless of preferred staff assignment</div>
                    </div>
                  </Label>
                  {preferredStaffFilterMode === 'all' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="specific" id="mode-specific" />
                  <Label htmlFor="mode-specific" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Specific Staff</div>
                      <div className="text-xs text-gray-500">Show only tasks assigned to selected staff members</div>
                    </div>
                  </Label>
                  {preferredStaffFilterMode === 'specific' && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="none" id="mode-none" />
                  <Label htmlFor="mode-none" className="flex items-center gap-3 cursor-pointer flex-1">
                    <UserX className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Unassigned Only</div>
                      <div className="text-xs text-gray-500">Show only tasks without preferred staff assignments</div>
                    </div>
                  </Label>
                  {preferredStaffFilterMode === 'none' && (
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Staff Selection (only shown in 'specific' mode) */}
            {preferredStaffFilterMode === 'specific' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Select Staff Members 
                  <Badge variant="outline" className="ml-2">
                    {selectedPreferredStaff.length}/{availablePreferredStaff.length}
                  </Badge>
                </Label>
                
                {availablePreferredStaff.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    No preferred staff assignments found.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {availablePreferredStaff.map(staff => (
                      <label key={staff.id} className="flex items-center gap-3 text-sm cursor-pointer p-2 hover:bg-white rounded transition-colors">
                        <Checkbox
                          checked={selectedPreferredStaff.includes(staff.id)}
                          onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                        />
                        <span className="flex-1">{staff.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {/* Selection summary for specific mode */}
                {selectedPreferredStaff.length > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    Filtering to {selectedPreferredStaff.length} staff member{selectedPreferredStaff.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Current Mode Status */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                {getModeIcon(preferredStaffFilterMode)}
                <strong>Current Mode:</strong> {getModeDescription(preferredStaffFilterMode)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThreeModePreferredStaffFilter;
