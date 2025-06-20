
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
  Building2,
  Wrench,
  CheckCircle
} from 'lucide-react';
import { SkillType } from '@/types/task';
import { PreferredStaffFilterEnhanced } from './components/demand/components/PreferredStaffFilterEnhanced';

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

  // Phase 3: Enhanced preferred staff controls with three-mode system
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
 * Phase 3: Enhanced Demand Matrix Controls Component - Three-Mode UI with Visual Indicators
 * 
 * PHASE 3 ENHANCEMENTS:
 * - Uses enhanced PreferredStaffFilterEnhanced component with visual indicators
 * - Improved accessibility and user experience
 * - Clear visual distinction between filtering modes
 * - Comprehensive status indicators and feedback
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
  return (
    <div className="space-y-4">
      {/* Phase 3 Status Indicator */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Phase 3: Enhanced UI with Visual Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700">
            <div className="p-2 bg-blue-100 rounded text-xs">
              ✅ <strong>Phase 3 Active:</strong> Enhanced preferred staff filter with distinct visual modes and accessibility improvements
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

      {/* Phase 3: Enhanced Preferred Staff Filter */}
      <Card>
        <CardContent className="pt-6">
          {preferredStaffLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading preferred staff...
            </div>
          ) : (
            <PreferredStaffFilterEnhanced
              availablePreferredStaff={availablePreferredStaff}
              selectedPreferredStaff={selectedPreferredStaff}
              onPreferredStaffToggle={onPreferredStaffToggle}
              preferredStaffFilterMode={preferredStaffFilterMode}
              onPreferredStaffFilterModeChange={onPreferredStaffFilterModeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandMatrixControls;
