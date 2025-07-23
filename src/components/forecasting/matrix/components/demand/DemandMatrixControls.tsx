
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, RotateCcw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SkillType } from '@/types/task';

interface DemandMatrixControlsProps {
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  className?: string;
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  skillsLoading: boolean;
  clientsLoading: boolean;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  selectedPreferredStaff: string[];
  handlePreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: Array<{ id: string; name: string; roleTitle?: string }>;
  preferredStaffLoading: boolean;
  preferredStaffError: Error | null;
  isAllPreferredStaffSelected: boolean;
  refetchPreferredStaff: () => void;
  matrixType?: 'demand' | 'detail';
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DemandMatrixControls: React.FC<DemandMatrixControlsProps> = ({
  selectedSkills,
  onSkillToggle,
  selectedClients,
  onClientToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  className,
  availableSkills,
  availableClients,
  skillsLoading,
  clientsLoading,
  isAllSkillsSelected,
  isAllClientsSelected,
  selectedPreferredStaff,
  handlePreferredStaffToggle,
  availablePreferredStaff,
  preferredStaffLoading,
  preferredStaffError,
  isAllPreferredStaffSelected,
  refetchPreferredStaff,
  matrixType = 'demand'
}) => {
  const handleSkillSelectAll = () => {
    if (isAllSkillsSelected) {
      // Deselect all skills
      selectedSkills.forEach(skill => onSkillToggle(skill));
    } else {
      // Select all available skills
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  const handleClientSelectAll = () => {
    if (isAllClientsSelected) {
      // Deselect all clients
      selectedClients.forEach(clientId => onClientToggle(clientId));
    } else {
      // Select all available clients
      availableClients.forEach(client => {
        if (!selectedClients.includes(client.id)) {
          onClientToggle(client.id);
        }
      });
    }
  };

  const handlePreferredStaffSelectAll = () => {
    if (isAllPreferredStaffSelected) {
      // Deselect all staff
      selectedPreferredStaff.forEach(staffId => handlePreferredStaffToggle(staffId));
    } else {
      // Select all available staff
      availablePreferredStaff.forEach(staff => {
        if (!selectedPreferredStaff.includes(staff.id)) {
          handlePreferredStaffToggle(staff.id);
        }
      });
    }
  };

  const handleMonthStart = (value: string) => {
    const start = parseInt(value);
    onMonthRangeChange({ 
      start, 
      end: Math.max(start, monthRange.end) 
    });
  };

  const handleMonthEnd = (value: string) => {
    const end = parseInt(value);
    onMonthRangeChange({ 
      start: Math.min(monthRange.start, end), 
      end 
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {matrixType === 'detail' ? 'Detail Matrix Controls' : 'Demand Matrix Controls'}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Range */}
        <div>
          <Label className="text-sm font-medium">Time Period</Label>
          <div className="mt-2 space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Start Month</Label>
              <select 
                value={monthRange.start} 
                onChange={(e) => handleMonthStart(e.target.value)}
                className="w-full mt-1 px-3 py-1 text-sm border rounded-md bg-background"
              >
                {MONTH_NAMES.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End Month</Label>
              <select 
                value={monthRange.end} 
                onChange={(e) => handleMonthEnd(e.target.value)}
                className="w-full mt-1 px-3 py-1 text-sm border rounded-md bg-background"
              >
                {MONTH_NAMES.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Period: {MONTH_NAMES[monthRange.start]} - {MONTH_NAMES[monthRange.end]}
          </div>
        </div>

        <Separator />

        {/* Skills Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Skills</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {selectedSkills.length}/{availableSkills.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkillSelectAll}
                className="text-xs h-6 px-2"
              >
                {isAllSkillsSelected ? 'None' : 'All'}
              </Button>
            </div>
          </div>
          
          {skillsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading skills...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableSkills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => onSkillToggle(skill)}
                  />
                  <Label 
                    htmlFor={`skill-${skill}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Clients Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Clients</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {selectedClients.length}/{availableClients.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClientSelectAll}
                className="text-xs h-6 px-2"
              >
                {isAllClientsSelected ? 'None' : 'All'}
              </Button>
            </div>
          </div>
          
          {clientsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading clients...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableClients.map((client) => (
                <div key={client.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`client-${client.id}`}
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => onClientToggle(client.id)}
                  />
                  <Label 
                    htmlFor={`client-${client.id}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {client.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Preferred Staff Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Preferred Staff</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {selectedPreferredStaff.length}/{availablePreferredStaff.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePreferredStaffSelectAll}
                className="text-xs h-6 px-2"
              >
                {isAllPreferredStaffSelected ? 'None' : 'All'}
              </Button>
            </div>
          </div>
          
          {preferredStaffLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading staff...</span>
            </div>
          ) : preferredStaffError ? (
            <Alert className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">Failed to load staff</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refetchPreferredStaff}
                  className="text-xs h-6 px-2 ml-2"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availablePreferredStaff.map((staff) => (
                <div key={staff.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`staff-${staff.id}`}
                    checked={selectedPreferredStaff.includes(staff.id)}
                    onCheckedChange={() => handlePreferredStaffToggle(staff.id)}
                  />
                  <Label 
                    htmlFor={`staff-${staff.id}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {staff.name}
                    {staff.roleTitle && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({staff.roleTitle})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <Label className="text-sm font-medium">Actions</Label>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="w-full text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
