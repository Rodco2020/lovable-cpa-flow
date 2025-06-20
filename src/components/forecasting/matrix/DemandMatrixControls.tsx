
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  RotateCcw, 
  Filter,
  RefreshCw,
  Users,
  Building2,
  Wrench,
  CheckCircle,
  Target,
  UserX,
  Globe
} from 'lucide-react';
import { SkillType } from '@/types/task';

interface DemandMatrixControlsProps {
  // Skill controls
  availableSkills: SkillType[];
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  isAllSkillsSelected: boolean;

  // Client controls
  availableClients: Array<{ id: string; name: string }>;
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  isAllClientsSelected: boolean;

  // Phase 2: Enhanced preferred staff controls with three-mode system
  availablePreferredStaff: Array<{ id: string; name: string }>;
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;

  // Actions
  onReset: () => void;
  onExport: () => void;
  onManualRefresh?: () => void;

  // Loading states
  skillsLoading?: boolean;
  clientsLoading?: boolean;
  preferredStaffLoading?: boolean;
}

/**
 * Phase 2: Enhanced Demand Matrix Controls Component - Three-Mode Preferred Staff Filtering
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Added radio button group for three filtering modes: 'all', 'specific', 'none'
 * - Enhanced UI indicators for current mode state
 * - Improved accessibility and user experience
 * - Advanced validation and status indicators
 */
export const DemandMatrixControls: React.FC<DemandMatrixControlsProps> = ({
  availableSkills,
  selectedSkills,
  onSkillToggle,
  isAllSkillsSelected,
  availableClients,
  selectedClients,
  onClientToggle,
  isAllClientsSelected,
  availablePreferredStaff,
  selectedPreferredStaff,
  onPreferredStaffToggle,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  onReset,
  onExport,
  onManualRefresh,
  skillsLoading = false,
  clientsLoading = false,
  preferredStaffLoading = false
}) => {
  // Phase 2: Helper function to get mode description
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

  // Phase 2: Helper function to get mode icon
  const getModeIcon = (mode: 'all' | 'specific' | 'none') => {
    switch (mode) {
      case 'all':
        return <Globe className="h-4 w-4" />;
      case 'specific':
        return <Target className="h-4 w-4" />;
      case 'none':
        return <UserX className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Phase 2 Status Indicator */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Phase 2: Three-Mode Preferred Staff Filtering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700">
            <div className="mb-2 flex items-center gap-2">
              {getModeIcon(preferredStaffFilterMode)}
              <strong>Current Mode:</strong> 
              <Badge variant="secondary" className="ml-1">
                {preferredStaffFilterMode.toUpperCase()}
              </Badge>
            </div>
            <div className="p-2 bg-blue-100 rounded text-xs">
              ✅ <strong>Phase 2 Active:</strong> {getModeDescription(preferredStaffFilterMode)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Matrix Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
            
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            {onManualRefresh && (
              <Button 
                onClick={onManualRefresh} 
                variant="outline" 
                size="sm"
                disabled={preferredStaffLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${preferredStaffLoading ? 'animate-spin' : ''}`} />
                Refresh Cache
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Skills
            <Badge variant="secondary">
              {isAllSkillsSelected ? 'All' : `${selectedSkills.length}/${availableSkills.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading skills...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableSkills.map(skill => (
                <label key={skill} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => onSkillToggle(skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clients Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Clients
            <Badge variant="secondary">
              {isAllClientsSelected ? 'All' : `${selectedClients.length}/${availableClients.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading clients...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {availableClients.map(client => (
                <label key={client.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => onClientToggle(client.id)}
                  />
                  <span>{client.name}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 2: Enhanced Preferred Staff Filter with Three-Mode System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Preferred Staff
            <Badge variant="secondary" className="flex items-center gap-1">
              {getModeIcon(preferredStaffFilterMode)}
              {preferredStaffFilterMode.toUpperCase()}
            </Badge>
            {preferredStaffLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
            )}
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
              {/* Phase 2: Filter Mode Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Filter Mode</Label>
                <RadioGroup
                  value={preferredStaffFilterMode}
                  onValueChange={onPreferredStaffFilterModeChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <RadioGroupItem value="all" id="mode-all" />
                    <Label htmlFor="mode-all" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Globe className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">All Tasks</div>
                        <div className="text-xs text-gray-500">Show all tasks regardless of preferred staff</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <RadioGroupItem value="specific" id="mode-specific" />
                    <Label htmlFor="mode-specific" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Specific Staff</div>
                        <div className="text-xs text-gray-500">Show only tasks for selected staff members</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <RadioGroupItem value="none" id="mode-none" />
                    <Label htmlFor="mode-none" className="flex items-center gap-2 cursor-pointer flex-1">
                      <UserX className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="font-medium">Unassigned Only</div>
                        <div className="text-xs text-gray-500">Show only tasks without preferred staff</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Phase 2: Staff Selection (only shown in 'specific' mode) */}
              {preferredStaffFilterMode === 'specific' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Select Staff Members 
                    <Badge variant="outline" className="ml-2">
                      {selectedPreferredStaff.length}/{availablePreferredStaff.length}
                    </Badge>
                  </Label>
                  
                  {availablePreferredStaff.length === 0 ? (
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                      No preferred staff assignments found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                      {availablePreferredStaff.map(staff => (
                        <label key={staff.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-gray-50 rounded">
                          <Checkbox
                            checked={selectedPreferredStaff.includes(staff.id)}
                            onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                          />
                          <span>{staff.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Phase 2: Current Mode Status */}
              <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
                <strong>Current:</strong> {getModeDescription(preferredStaffFilterMode)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandMatrixControls;
