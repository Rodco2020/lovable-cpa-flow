
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Eye, EyeOff, AlertCircle, RefreshCw, ChevronDown, Bug } from 'lucide-react';
import { SkillType } from '@/types/task';
import { useEnhancedMatrixSkills } from '../../hooks/useEnhancedMatrixSkills';

interface EnhancedSkillsFilterSectionProps {
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
}

/**
 * Enhanced Skills Filter Section Component
 * Includes diagnostic information and force refresh capabilities
 */
export const EnhancedSkillsFilterSection: React.FC<EnhancedSkillsFilterSectionProps> = ({
  selectedSkills,
  onSkillToggle
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const { 
    availableSkills, 
    isLoading, 
    error, 
    refetchSkills,
    forceRefreshSkills,
    diagnostics
  } = useEnhancedMatrixSkills();

  const handleSelectAllSkills = (): void => {
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

  const handleForceRefresh = async () => {
    console.log('🔥 [ENHANCED SKILLS FILTER] Force refresh button clicked');
    await forceRefreshSkills();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Enhanced Skills Filter
          {isLoading && (
            <RefreshCw className="h-3 w-3 ml-1 inline animate-spin" />
          )}
        </Label>
        <div className="flex items-center gap-1">
          {error && (
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
            onClick={handleForceRefresh}
            className="text-xs h-auto p-1 text-orange-600"
            title="Force refresh cache and reload skills"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Force Refresh
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSelectAllSkills}
            className="text-xs h-auto p-1"
            disabled={isLoading || availableSkills.length === 0}
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
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          <div className="flex-1">{error}</div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-xs h-auto p-1"
          >
            <Bug className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Diagnostic Information */}
      {(error || showDiagnostics) && diagnostics && (
        <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs h-auto p-1 w-full justify-between">
              <span>Diagnostic Information</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="text-xs bg-muted p-2 rounded font-mono">
              <div><strong>Source:</strong> {diagnostics.source || 'unknown'}</div>
              <div><strong>Load Time:</strong> {diagnostics.loadTime?.toFixed(2)}ms</div>
              <div><strong>Cache Hit:</strong> {diagnostics.cacheHit ? 'Yes' : 'No'}</div>
              {diagnostics.cacheStats && (
                <div><strong>Cache Skills:</strong> {diagnostics.cacheStats.skillsCount}</div>
              )}
              {diagnostics.finalStats && (
                <div><strong>Final Skills:</strong> {diagnostics.finalStats.skillsCount}</div>
              )}
              {diagnostics.fallbackUsed && (
                <div className="text-orange-600"><strong>Fallback Used:</strong> Yes</div>
              )}
              {diagnostics.emergencyFallback && (
                <div className="text-red-600"><strong>Emergency Fallback:</strong> Yes</div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Skills Loading State */}
      {isLoading && (
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
      {!isLoading && !error && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availableSkills.length === 0 ? (
            <div className="text-xs text-muted-foreground italic space-y-1">
              <div>No skills available. This might indicate:</div>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Database connection issues</li>
                <li>Empty skills table</li>
                <li>Cache loading problems</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceRefresh}
                className="text-xs h-auto p-2 mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Force Refresh
              </Button>
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
            Enhanced Loading
          </Badge>
        )}
        {diagnostics?.source && (
          <Badge variant="outline" className="text-xs">
            Source: {diagnostics.source}
          </Badge>
        )}
      </div>
    </div>
  );
};
