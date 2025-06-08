
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCcw } from 'lucide-react';
import { SkillType } from '@/types/task';

interface DemandMatrixControlsProps {
  selectedSkills: SkillType[];
  selectedClients: string[];
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (clientId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  className?: string;
}

export const DemandMatrixControls: React.FC<DemandMatrixControlsProps> = ({
  selectedSkills,
  selectedClients,
  onSkillToggle,
  onClientToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  className
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleSelectAllSkills = () => {
    if (selectedSkills.length === availableSkills.length) {
      // Deselect all
      availableSkills.forEach(onSkillToggle);
    } else {
      // Select all
      availableSkills.filter(skill => !selectedSkills.includes(skill)).forEach(onSkillToggle);
    }
  };

  const handleSelectAllClients = () => {
    if (selectedClients.length === availableClients.length) {
      // Deselect all
      availableClients.forEach(client => onClientToggle(client.id));
    } else {
      // Select all
      availableClients.filter(client => !selectedClients.includes(client.id)).forEach(client => onClientToggle(client.id));
    }
  };

  const handleMonthRangeSliderChange = (values: number[]) => {
    onMonthRangeChange({ start: values[0], end: values[1] });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Matrix Controls</CardTitle>
          <Button 
            onClick={onReset} 
            variant="outline" 
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Time Period</label>
            <span className="text-xs text-muted-foreground">
              {monthNames[monthRange.start]} - {monthNames[monthRange.end]}
            </span>
          </div>
          <Slider
            value={[monthRange.start, monthRange.end]}
            onValueChange={handleMonthRangeSliderChange}
            max={11}
            min={0}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </div>

        <Separator />

        {/* Skills Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Skills</label>
            <Button 
              onClick={handleSelectAllSkills}
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              {selectedSkills.length === availableSkills.length ? 'None' : 'All'}
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => onSkillToggle(skill)}
                />
                <label
                  htmlFor={`skill-${skill}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={skill}
                >
                  {skill}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Clients Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Clients</label>
            <Button 
              onClick={handleSelectAllClients}
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              {selectedClients.length === availableClients.length ? 'None' : 'All'}
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableClients.map((client) => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => onClientToggle(client.id)}
                />
                <label
                  htmlFor={`client-${client.id}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={client.name}
                >
                  {client.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <label className="text-sm font-medium mb-3 block">Actions</label>
          <Button 
            onClick={onExport} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
