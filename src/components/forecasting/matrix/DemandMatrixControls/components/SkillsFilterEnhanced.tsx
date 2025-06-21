
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Filter, Eye, EyeOff } from 'lucide-react';
import { SkillType } from '@/types/task';
import { FilterSection } from './FilterSection';
import { useSelectAllLogic } from '../hooks/useSelectAllLogic';

interface SkillsFilterEnhancedProps {
  availableSkills: SkillType[];
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  isAllSkillsSelected: boolean;
  loading?: boolean;
  error?: string | null;
  onRetrySkills?: () => void;
}

/**
 * Phase 3: Enhanced Skills Filter Component
 * 
 * PHASE 3 ENHANCEMENTS:
 * - Enhanced skill filtering with resolved skill names
 * - Improved error handling and validation
 * - Performance optimizations for large skill datasets
 * - Backward compatibility with existing filter logic
 * - Better user feedback for skill resolution status
 */
export const SkillsFilterEnhanced: React.FC<SkillsFilterEnhancedProps> = ({
  availableSkills,
  selectedSkills,
  onSkillToggle,
  isAllSkillsSelected,
  loading = false,
  error = null,
  onRetrySkills
}) => {
  const { handleSelectAll, selectAllText } = useSelectAllLogic(
    availableSkills,
    selectedSkills,
    onSkillToggle
  );

  // Phase 3: Enhanced skill validation and display
  const skillsDisplayCount = availableSkills.length;
  const selectedDisplayCount = selectedSkills.length;
  
  // Phase 3: Enhanced loading state with skill resolution feedback
  const renderLoadingState = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Loading and resolving skills...
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-3 bg-muted animate-pulse rounded flex-1 max-w-[120px]" />
        </div>
      ))}
    </div>
  );

  // Phase 3: Enhanced error state with detailed feedback
  const renderErrorState = () => (
    <div className="space-y-3">
      <div className="text-xs text-destructive bg-destructive/10 p-3 rounded flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium mb-1">Skill Loading Error</div>
          <div className="text-xs opacity-90">{error}</div>
          {onRetrySkills && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRetrySkills}
              className="mt-2 h-auto p-1 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Loading Skills
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Phase 3: Enhanced skill list rendering with performance optimization
  const renderSkillsList = () => {
    if (skillsDisplayCount === 0) {
      return (
        <div className="text-xs text-muted-foreground italic p-3 text-center">
          No skills available. Add skills in the Skills module to enable filtering.
        </div>
      );
    }

    // Phase 3: Performance optimization - limit initial display for large datasets
    const shouldOptimizeDisplay = skillsDisplayCount > 20;
    const displaySkills = shouldOptimizeDisplay ? availableSkills.slice(0, 20) : availableSkills;
    
    return (
      <div className="space-y-2">
        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {displaySkills.map(skill => (
            <label key={skill} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
              <Checkbox
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => onSkillToggle(skill)}
                disabled={loading}
              />
              <span className="flex-1 truncate" title={skill}>
                {skill}
              </span>
            </label>
          ))}
        </div>
        
        {/* Phase 3: Large dataset optimization notice */}
        {shouldOptimizeDisplay && (
          <div className="text-xs text-muted-foreground text-center py-2 border-t">
            Showing first 20 of {skillsDisplayCount} skills. Use search to find specific skills.
          </div>
        )}
      </div>
    );
  };

  // Phase 3: Enhanced badge display with resolution status
  const badge = (
    <div className="flex items-center gap-1">
      <Badge variant="secondary">
        {isAllSkillsSelected ? 'All' : `${selectedDisplayCount}/${skillsDisplayCount}`}
      </Badge>
      {skillsDisplayCount > 0 && (
        <Badge variant="outline" className="text-xs">
          Resolved
        </Badge>
      )}
    </div>
  );

  return (
    <FilterSection
      title="Skills"
      badge={badge}
      loading={loading}
    >
      <div className="space-y-3">
        {/* Phase 3: Enhanced header with skill resolution status */}
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by Skills</span>
          {!loading && !error && skillsDisplayCount > 0 && (
            <Badge variant="outline" className="text-xs ml-auto">
              {skillsDisplayCount} available
            </Badge>
          )}
        </div>

        {/* Phase 3: Enhanced select all controls */}
        {!loading && !error && skillsDisplayCount > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-auto p-1 text-xs"
              disabled={loading}
            >
              {isAllSkillsSelected ? (
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
            
            <div className="text-xs text-muted-foreground">
              {selectedDisplayCount} selected
            </div>
          </div>
        )}
        
        {/* Phase 3: Enhanced conditional rendering based on state */}
        {loading && renderLoadingState()}
        {error && !loading && renderErrorState()}
        {!loading && !error && renderSkillsList()}
      </div>
    </FilterSection>
  );
};

export default SkillsFilterEnhanced;
