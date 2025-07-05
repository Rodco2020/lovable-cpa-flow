import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, RotateCcw, Filter, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface MatrixControlsPanelProps {
  // Filter props
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
  onPreferredStaffToggle: (staff: string) => void;
  
  // Month range props
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  
  // Action props
  onExport: () => void;
  onPrintExport: () => void;
  onReset: () => void;
  
  // Data props
  availableSkills: Array<{ id: string; name: string }>;
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  
  // Loading/error states
  preferredStaffLoading?: boolean;
  preferredStaffError?: string | null;
  isAllPreferredStaffSelected?: boolean;
  onRetryPreferredStaff?: () => void;
  
  // Config
  groupingMode: 'skill' | 'client';
  matrixType?: 'demand' | 'detail';
  title?: string;
}

/**
 * Shared Matrix Controls Panel - Phase 5
 * 
 * Generic controls panel that can be used by both Demand and Detail matrices.
 * Extracted from DemandMatrixControls to promote reusability.
 */
const MatrixControlsPanelComponent: React.FC<MatrixControlsPanelProps> = ({
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onPrintExport,
  onReset,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  preferredStaffLoading = false,
  preferredStaffError = null,
  isAllPreferredStaffSelected = false,
  onRetryPreferredStaff,
  groupingMode,
  matrixType = 'demand',
  title
}) => {
  const hasActiveFilters = selectedSkills.length > 0 || 
                          selectedClients.length > 0 || 
                          selectedPreferredStaff.length > 0 ||
                          (monthRange.start !== 0 || monthRange.end !== 11);

  const activeFiltersCount = [
    selectedSkills.length > 0,
    selectedClients.length > 0,
    selectedPreferredStaff.length > 0,
    monthRange.start !== 0 || monthRange.end !== 11
  ].filter(Boolean).length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>{title || `${matrixType === 'demand' ? 'Demand' : 'Detail'} Matrix Filters`}</span>
          </div>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skills Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableSkills.map(skill => (
              <div key={skill.id} className="flex items-center space-x-2">
                <Checkbox 
                  checked={selectedSkills.includes(skill.id)}
                  onCheckedChange={() => onSkillToggle(skill.id)}
                />
                <span className="text-sm">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Clients Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Clients</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableClients.map(client => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox 
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => onClientToggle(client.id)}
                />
                <span className="text-sm">{client.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Preferred Staff Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Staff</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availablePreferredStaff.map(staff => (
              <div key={staff.id} className="flex items-center space-x-2">
                <Checkbox 
                  checked={selectedPreferredStaff.includes(staff.id)}
                  onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                />
                <span className="text-sm">{staff.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Month Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Month Range</label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Start</label>
                <select
                  value={monthRange.start}
                  onChange={(e) => onMonthRangeChange({ ...monthRange, start: parseInt(e.target.value) })}
                  className="w-full p-1 text-xs border rounded"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2024, i).toLocaleDateString('en', { month: 'short' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End</label>
                <select
                  value={monthRange.end}
                  onChange={(e) => onMonthRangeChange({ ...monthRange, end: parseInt(e.target.value) })}
                  className="w-full p-1 text-xs border rounded"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2024, i).toLocaleDateString('en', { month: 'short' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrintExport}
              className="text-xs"
            >
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="w-full text-xs text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset All Filters
            </Button>
          )}
        </div>

        {/* Grouping Mode Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Grouped by:</span>
            <Badge variant="outline" className="text-xs">
              {groupingMode}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MatrixControlsPanel = memo(MatrixControlsPanelComponent);