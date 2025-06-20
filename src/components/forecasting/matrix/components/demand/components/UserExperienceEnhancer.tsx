
import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Info, 
  Target, 
  Globe, 
  UserX, 
  ChevronRight,
  Lightbulb,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserExperienceEnhancerProps {
  currentMode: 'all' | 'specific' | 'none';
  selectedCount: number;
  totalCount: number;
  onModeChange: (mode: 'all' | 'specific' | 'none') => void;
  showGuidance?: boolean;
  className?: string;
}

/**
 * Phase 3: User Experience Enhancer Component
 * 
 * Provides enhanced user experience features:
 * - Contextual tooltips and guidance
 * - Smooth mode transition feedback
 * - Clear filter state indicators
 * - Helpful suggestions and tips
 */
export const UserExperienceEnhancer: React.FC<UserExperienceEnhancerProps> = ({
  currentMode,
  selectedCount,
  totalCount,
  onModeChange,
  showGuidance = true,
  className
}) => {
  const [showTip, setShowTip] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Show helpful tips based on current state
  useEffect(() => {
    if (currentMode === 'specific' && selectedCount === 0) {
      setShowTip(true);
    } else {
      setShowTip(false);
    }
  }, [currentMode, selectedCount]);

  // Handle mode transitions with animation feedback
  const handleModeChange = (newMode: 'all' | 'specific' | 'none') => {
    setIsTransitioning(true);
    onModeChange(newMode);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const getModeTooltipContent = (mode: 'all' | 'specific' | 'none') => {
    switch (mode) {
      case 'all':
        return {
          title: 'Show All Tasks',
          description: 'Displays all tasks regardless of preferred staff assignment. Use this for a complete overview.',
          icon: <Globe className="h-4 w-4 text-green-600" />,
          examples: ['All client tasks', 'Assigned and unassigned', 'Complete workload view']
        };
      case 'specific':
        return {
          title: 'Filter by Specific Staff',
          description: 'Shows only tasks assigned to selected staff members. Perfect for workload planning.',
          icon: <Target className="h-4 w-4 text-blue-600" />,
          examples: ['Individual workloads', 'Team assignments', 'Capacity planning']
        };
      case 'none':
        return {
          title: 'Unassigned Tasks Only',
          description: 'Displays tasks without preferred staff assignments. Ideal for finding work to distribute.',
          icon: <UserX className="h-4 w-4 text-orange-600" />,
          examples: ['Available tasks', 'Unallocated work', 'Distribution planning']
        };
    }
  };

  const getCurrentStateMessage = () => {
    switch (currentMode) {
      case 'all':
        return `Showing all ${totalCount} staff members' tasks`;
      case 'specific':
        return selectedCount > 0 
          ? `Filtering tasks for ${selectedCount} of ${totalCount} staff members`
          : `Select staff members to filter tasks`;
      case 'none':
        return 'Showing only unassigned tasks';
    }
  };

  const getSuggestions = () => {
    if (currentMode === 'specific' && selectedCount === 0) {
      return {
        type: 'warning',
        message: 'Select staff members to see their assigned tasks',
        action: { label: 'Switch to All Tasks', onClick: () => handleModeChange('all') }
      };
    }
    
    if (currentMode === 'all' && totalCount > 10) {
      return {
        type: 'info',
        message: 'With many staff members, consider filtering to specific staff for better focus',
        action: { label: 'Filter by Staff', onClick: () => handleModeChange('specific') }
      };
    }

    return null;
  };

  const suggestion = getSuggestions();

  console.log(`✨ [PHASE 3 UX ENHANCER] Rendering enhanced user experience:`, {
    currentMode,
    selectedCount,
    totalCount,
    isTransitioning,
    showTip,
    hasSuggestion: !!suggestion
  });

  return (
    <TooltipProvider>
      <div className={cn("space-y-3", className)}>
        {/* Current State Indicator with Transition Animation */}
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg border transition-all duration-300",
          isTransitioning && "scale-105 shadow-md",
          currentMode === 'all' && "bg-green-50 border-green-200",
          currentMode === 'specific' && "bg-blue-50 border-blue-200",
          currentMode === 'none' && "bg-orange-50 border-orange-200"
        )}>
          {getModeTooltipContent(currentMode).icon}
          <span className="text-sm font-medium flex-1">
            {getCurrentStateMessage()}
          </span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  {getModeTooltipContent(currentMode).icon}
                  {getModeTooltipContent(currentMode).title}
                </div>
                <p className="text-sm text-gray-600">
                  {getModeTooltipContent(currentMode).description}
                </p>
                <div className="text-xs">
                  <div className="font-medium mb-1">Use cases:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {getModeTooltipContent(currentMode).examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Mode Switch Suggestions */}
        {showGuidance && (
          <div className="flex gap-2">
            {(['all', 'specific', 'none'] as const).map((mode) => {
              if (mode === currentMode) return null;
              
              const config = getModeTooltipContent(mode);
              return (
                <Tooltip key={mode}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModeChange(mode)}
                      className="flex items-center gap-2 text-xs hover:scale-105 transition-transform"
                    >
                      {config.icon}
                      Switch to {config.title}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Contextual Suggestions */}
        {suggestion && (
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg border animate-fade-in",
            suggestion.type === 'warning' && "bg-yellow-50 border-yellow-200",
            suggestion.type === 'info' && "bg-blue-50 border-blue-200"
          )}>
            <Lightbulb className={cn(
              "h-5 w-5",
              suggestion.type === 'warning' && "text-yellow-600",
              suggestion.type === 'info' && "text-blue-600"
            )} />
            
            <div className="flex-1">
              <p className="text-sm">{suggestion.message}</p>
            </div>
            
            {suggestion.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={suggestion.action.onClick}
                className="text-xs"
              >
                {suggestion.action.label}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTip(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filter Statistics */}
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            {totalCount} total staff
          </Badge>
          
          {currentMode === 'specific' && selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedCount} selected
            </Badge>
          )}
          
          <Badge 
            variant={isTransitioning ? "default" : "outline"} 
            className={cn(
              "text-xs transition-all duration-300",
              isTransitioning && "animate-pulse"
            )}
          >
            {currentMode.toUpperCase()} mode
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UserExperienceEnhancer;
