
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  RotateCcw, 
  Filter,
  RefreshCw,
  Users,
  Building2,
  Wrench
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

  // Preferred staff controls
  availablePreferredStaff: Array<{ id: string; name: string }>;
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  isAllPreferredStaffSelected: boolean;

  // Actions
  onReset: () => void;
  onExport: () => void;
  onManualRefresh?: () => void; // Phase 3: New manual refresh action

  // Loading states
  skillsLoading?: boolean;
  clientsLoading?: boolean;
  preferredStaffLoading?: boolean;
}

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
  onReset,
  onExport,
  onManualRefresh, // Phase 3: Manual refresh prop
  skillsLoading = false,
  clientsLoading = false,
  preferredStaffLoading = false
}) => {
  return (
    <div className="space-y-4">
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

            {/* Phase 3: Manual refresh button */}
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

      {/* Preferred Staff Filter - Phase 3: Enhanced with refresh capability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Preferred Staff
            <Badge variant="secondary">
              {isAllPreferredStaffSelected ? 'All (Show All Tasks)' : `${selectedPreferredStaff.length}/${availablePreferredStaff.length}`}
            </Badge>
            {/* Phase 3: Show loading indicator for preferred staff */}
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
          ) : availablePreferredStaff.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
              No preferred staff assignments found. Tasks without preferred staff will still be shown when "All" is selected.
            </div>
          ) : (
            <>
              <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                <strong>Phase 3:</strong> Cache automatically refreshes when preferred staff assignments change.
                {isAllPreferredStaffSelected 
                  ? ' Currently showing ALL tasks (with and without preferred staff).' 
                  : ' Currently filtering to selected staff only.'
                }
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {availablePreferredStaff.map(staff => (
                  <label key={staff.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedPreferredStaff.includes(staff.id)}
                      onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                    />
                    <span>{staff.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandMatrixControls;
