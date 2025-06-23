
/**
 * Demand Matrix Controls Panel Component
 * Provides filtering and control options for the demand matrix
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Download, RotateCcw, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  onPrintExport: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  onPrintExport,
  groupingMode,
  availableSkills,
  availableClients,
  availablePreferredStaff
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Controls</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleControls}
          >
            {isControlsExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrintExport}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
        
        {/* Skills Filter */}
        <div className="space-y-2">
          <h4 className="font-medium">Skills</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {availableSkills.map(skill => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => onSkillToggle(skill)}
                />
                <label htmlFor={`skill-${skill}`} className="text-sm">
                  {skill}
                </label>
              </div>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Clients Filter */}
        <div className="space-y-2">
          <h4 className="font-medium">Clients</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {availableClients.map(client => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => onClientToggle(client.id)}
                />
                <label htmlFor={`client-${client.id}`} className="text-sm">
                  {client.name}
                </label>
              </div>
            ))}
          </div>
          {selectedClients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedClients.map(clientId => {
                const client = availableClients.find(c => c.id === clientId);
                return (
                  <Badge key={clientId} variant="secondary" className="text-xs">
                    {client?.name || clientId}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Preferred Staff Filter */}
        <div className="space-y-2">
          <h4 className="font-medium">Preferred Staff</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {availablePreferredStaff.map(staff => (
              <div key={staff.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`staff-${staff.id}`}
                  checked={selectedPreferredStaff.includes(staff.id)}
                  onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                />
                <label htmlFor={`staff-${staff.id}`} className="text-sm">
                  {staff.name}
                </label>
              </div>
            ))}
          </div>
          {selectedPreferredStaff.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedPreferredStaff.map(staffId => {
                const staff = availablePreferredStaff.find(s => s.id === staffId);
                return (
                  <Badge key={staffId} variant="secondary" className="text-xs">
                    {staff?.name || staffId}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Month Range */}
        <div className="space-y-2">
          <h4 className="font-medium">Month Range</h4>
          <div className="text-sm text-muted-foreground">
            Showing months {monthRange.start + 1} to {monthRange.end + 1}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
