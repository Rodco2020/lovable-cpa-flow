
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Eye, EyeOff, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { SkillType } from '@/types/task';
import { useMatrixSkills } from './hooks/useMatrixSkills';

interface MatrixControlsProps {
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  viewMode: 'hours' | 'percentage';
  onViewModeChange: (mode: 'hours' | 'percentage') => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  className?: string;
}

const MONTH_RANGES = [
  { label: 'All 12 Months', start: 0, end: 11 },
  { label: 'Q1 (Jan-Mar)', start: 0, end: 2 },
  { label: 'Q2 (Apr-Jun)', start: 3, end: 5 },
  { label: 'Q3 (Jul-Sep)', start: 6, end: 8 },
  { label: 'Q4 (Oct-Dec)', start: 9, end: 11 },
  { label: 'Next 6 Months', start: 0, end: 5 },
  { label: 'Last 6 Months', start: 6, end: 11 }
];

/**
 * Matrix controls component with dynamic skills integration
 */
export const MatrixControls: React.FC<MatrixControlsProps> = ({
  selectedSkills,
  onSkillToggle,
  viewMode,
  onViewModeChange,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  className
}) => {
  // Use dynamic skills hook
  const { 
    availableSkills, 
    isLoading: skillsLoading, 
    error: skillsError,
    refetchSkills 
  } = useMatrixSkills();

  const handleSelectAllSkills = () => {
    if (selectedSkills.length === availableSkills.length) {
      // Deselect all
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      // Select all missing skills
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  const getCurrentRangeLabel = () => {
    const range = MONTH_RANGES.find(r => r.start === monthRange.start && r.end === monthRange.end);
    return range ? range.label : 'Custom Range';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Matrix Controls
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">View Mode</Label>
          <Select value={viewMode} onValueChange={onViewModeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Hours View</SelectItem>
              <SelectItem value="percentage">Percentage View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Month Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Month Range</Label>
          <Select 
            value={`${monthRange.start}-${monthRange.end}`} 
            onValueChange={(value) => {
              const [start, end] = value.split('-').map(Number);
              onMonthRangeChange({ start, end });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getCurrentRangeLabel()} />
            </SelectTrigger>
            <SelectContent>
              {MONTH_RANGES.map((range) => (
                <SelectItem 
                  key={`${range.start}-${range.end}`} 
                  value={`${range.start}-${range.end}`}
                >
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Skills Filter - Dynamic Integration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Skills Filter
              {skillsLoading && (
                <RefreshCw className="h-3 w-3 ml-1 inline animate-spin" />
              )}
            </Label>
            <div className="flex items-center gap-1">
              {skillsError && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={refetchSkills}
                  className="text-xs h-auto p-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectAllSkills}
                className="text-xs h-auto p-1"
                disabled={skillsLoading || availableSkills.length === 0}
              >
                {selectedSkills.length === availableSkills.length ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide All
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show All
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Skills Error State */}
          {skillsError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              {skillsError}
            </div>
          )}
          
          {/* Skills Loading State */}
          {skillsLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded flex-1" />
                </div>
              ))}
            </div>
          )}
          
          {/* Skills List */}
          {!skillsLoading && !skillsError && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableSkills.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">
                  No skills available. Add skills in the Skills module.
                </div>
              ) : (
                availableSkills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => onSkillToggle(skill)}
                    />
                    <Label
                      htmlFor={`skill-${skill}`}
                      className="text-xs flex-1 cursor-pointer"
                    >
                      {skill}
                    </Label>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Selected skills summary */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {selectedSkills.length} of {availableSkills.length} selected
            </Badge>
            {availableSkills.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                From Database
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Actions</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport}
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Matrix
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixControls;
