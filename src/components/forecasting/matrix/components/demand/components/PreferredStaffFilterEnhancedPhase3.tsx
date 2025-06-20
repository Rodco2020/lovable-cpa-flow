import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronDown, Users, Globe, Target, UserX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { EdgeCaseHandler } from './EdgeCaseHandler';
import { UserExperienceEnhancer } from './UserExperienceEnhancer';
import { PerformanceOptimizer, usePerformanceOptimization } from './PerformanceOptimizer';

interface PreferredStaffOption {
  id: string;
  name: string;
}

interface PreferredStaffFilterEnhancedPhase3Props {
  availablePreferredStaff: PreferredStaffOption[];
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Phase 3: Enhanced Preferred Staff Filter with Advanced Features
 * 
 * Complete implementation with all Phase 3 enhancements:
 * - Edge case handling for all scenarios
 * - Enhanced user experience with tooltips and guidance
 * - Performance optimization for large datasets
 * - Smooth transitions and animations
 * - Robust error handling and loading states
 */
export const PreferredStaffFilterEnhancedPhase3: React.FC<PreferredStaffFilterEnhancedPhase3Props> = ({
  availablePreferredStaff,
  selectedPreferredStaff,
  onPreferredStaffToggle,
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  isLoading = false,
  error,
  onRefresh,
  className
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastMode, setLastMode] = useState(preferredStaffFilterMode);
  const { startTracking, endTracking, debouncedCallback } = usePerformanceOptimization('preferred-staff-filter');

  // Handle mode transitions with performance tracking
  const handleModeChange = useCallback((newMode: 'all' | 'specific' | 'none') => {
    startTracking();
    setIsTransitioning(true);
    setLastMode(preferredStaffFilterMode);
    
    // Debounced mode change for performance
    debouncedCallback(() => {
      onPreferredStaffFilterModeChange(newMode);
      setIsTransitioning(false);
      endTracking(`mode-change-${lastMode}-to-${newMode}`);
    }, 'mode-change');
  }, [preferredStaffFilterMode, onPreferredStaffFilterModeChange, debouncedCallback, startTracking, endTracking, lastMode]);

  // Handle staff selection with performance optimization
  const handleStaffToggle = useCallback((staffId: string) => {
    startTracking();
    onPreferredStaffToggle(staffId);
    endTracking('staff-toggle');
  }, [onPreferredStaffToggle, startTracking, endTracking]);

  // Determine current scenario for edge case handling
  const getCurrentScenario = (): 'no-data' | 'loading-error' | 'empty-selection' | 'data-refresh' | 'mode-transition' | 'success' => {
    if (error) return 'loading-error';
    if (isLoading) return 'data-refresh';
    if (isTransitioning) return 'mode-transition';
    if (availablePreferredStaff.length === 0) return 'no-data';
    if (preferredStaffFilterMode === 'specific' && selectedPreferredStaff.length === 0) return 'empty-selection';
    return 'success';
  };

  const scenario = getCurrentScenario();

  // Helper functions
  const getModeIcon = (mode: 'all' | 'specific' | 'none', isActive = false) => {
    const iconClass = cn("h-4 w-4 transition-colors duration-200", {
      "text-green-600": mode === 'all' && isActive,
      "text-blue-600": mode === 'specific' && isActive,
      "text-orange-600": mode === 'none' && isActive,
      "text-gray-500": !isActive
    });

    switch (mode) {
      case 'all':
        return <Globe className={iconClass} />;
      case 'specific':
        return <Target className={iconClass} />;
      case 'none':
        return <UserX className={iconClass} />;
      default:
        return <Users className={iconClass} />;
    }
  };

  const getModeDescription = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return `All Tasks (${availablePreferredStaff.length} staff available)`;
      case 'specific':
        return selectedPreferredStaff.length > 0 
          ? `${selectedPreferredStaff.length} Staff Selected`
          : 'Select Staff Members';
      case 'none':
        return 'Unassigned Tasks Only';
      default:
        return 'Select Filter Mode';
    }
  };

  const getButtonVariant = () => {
    if (isTransitioning) return "outline";
    
    switch (preferredStaffFilterMode) {
      case 'all':
        return "outline";
      case 'specific':
        return selectedPreferredStaff.length > 0 ? "default" : "outline";
      case 'none':
        return "outline";
      default:
        return "outline";
    }
  };

  console.log(`🚀 [PHASE 3 ENHANCED FILTER] Rendering with advanced features:`, {
    availableCount: availablePreferredStaff.length,
    selectedCount: selectedPreferredStaff.length,
    currentMode: preferredStaffFilterMode,
    scenario,
    isTransitioning,
    isLoading,
    hasError: !!error
  });

  // Handle edge cases with dedicated components
  if (scenario === 'loading-error' || scenario === 'no-data' || scenario === 'data-refresh') {
    return (
      <div className={cn("space-y-4", className)}>
        <Label className="text-sm font-medium text-gray-700">
          Preferred Staff Filter
        </Label>
        
        <EdgeCaseHandler
          scenario={scenario}
          staffCount={availablePreferredStaff.length}
          selectedCount={selectedPreferredStaff.length}
          onRefresh={onRefresh}
          onRetry={onRefresh}
          isLoading={isLoading}
          errorMessage={error}
        />
      </div>
    );
  }

  return (
    <PerformanceOptimizer
      memoizationKey={`${preferredStaffFilterMode}-${selectedPreferredStaff.length}-${availablePreferredStaff.length}`}
      debounceMs={300}
      onPerformanceMetrics={(metrics) => {
        console.log(`📊 [PHASE 3 PERFORMANCE METRICS]`, metrics);
      }}
    >
      <div className={cn("space-y-4", className)}>
        <Label className="text-sm font-medium text-gray-700">
          Preferred Staff Filter
        </Label>
        
        {/* Main Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={getButtonVariant()}
              className={cn(
                "w-full justify-between bg-white hover:bg-gray-50 border-gray-200 transition-all duration-300",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                preferredStaffFilterMode === 'all' && "border-green-300 bg-green-50",
                preferredStaffFilterMode === 'specific' && selectedPreferredStaff.length > 0 && "border-blue-300 bg-blue-50",
                preferredStaffFilterMode === 'none' && "border-orange-300 bg-orange-50",
                isTransitioning && "scale-105 shadow-md"
              )}
              disabled={isLoading || isTransitioning}
            >
              <div className="flex items-center space-x-2">
                {isTransitioning ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  getModeIcon(preferredStaffFilterMode, true)
                )}
                <span className="truncate">{getModeDescription()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs transition-all duration-200",
                    preferredStaffFilterMode === 'all' && "bg-green-100 text-green-800",
                    preferredStaffFilterMode === 'specific' && "bg-blue-100 text-blue-800",
                    preferredStaffFilterMode === 'none' && "bg-orange-100 text-orange-800",
                    isTransitioning && "animate-pulse"
                  )}
                >
                  {preferredStaffFilterMode.toUpperCase()}
                </Badge>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 shadow-lg z-50"
            align="start"
          >
            {/* Three Distinct Sections with Enhanced UI */}
            
            {/* Section 1: Show All */}
            <div className="p-2 bg-green-50 border-b border-green-200">
              <div className="text-xs font-semibold text-green-800 mb-1">SHOW ALL TASKS</div>
              <DropdownMenuItem
                onClick={() => handleModeChange('all')}
                className={cn(
                  "flex items-center space-x-3 hover:bg-green-100 cursor-pointer rounded p-2 transition-colors duration-200",
                  preferredStaffFilterMode === 'all' && "bg-green-200 border border-green-400"
                )}
              >
                
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center border-2 rounded-full",
                  preferredStaffFilterMode === 'all' ? "bg-green-600 border-green-600" : "border-green-400"
                )}>
                  {preferredStaffFilterMode === 'all' && <Check className="h-3 w-3 text-white" />}
                </div>
                <Globe className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">All Tasks</div>
                  <div className="text-xs text-green-600">Shows tasks with and without preferred staff</div>
                </div>
              </DropdownMenuItem>
            </div>
            
            <DropdownMenuSeparator />

            {/* Section 2: Specific Staff with Performance Optimization */}
            <div className="p-2 bg-blue-50 border-b border-blue-200">
              <div className="text-xs font-semibold text-blue-800 mb-1">FILTER BY SPECIFIC STAFF</div>
              <DropdownMenuItem
                onClick={() => handleModeChange('specific')}
                className={cn(
                  "flex items-center space-x-3 hover:bg-blue-100 cursor-pointer rounded p-2 transition-colors duration-200",
                  preferredStaffFilterMode === 'specific' && "bg-blue-200 border border-blue-400"
                )}
              >
                
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center border-2 rounded-full",
                  preferredStaffFilterMode === 'specific' ? "bg-blue-600 border-blue-600" : "border-blue-400"
                )}>
                  {preferredStaffFilterMode === 'specific' && <Check className="h-3 w-3 text-white" />}
                </div>
                <Target className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-blue-800">Specific Staff</div>
                  <div className="text-xs text-blue-600">Filter to selected staff members only</div>
                </div>
                {selectedPreferredStaff.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    {selectedPreferredStaff.length}
                  </Badge>
                )}
              </DropdownMenuItem>

              {/* Enhanced Staff Selection with Performance Optimization */}
              {preferredStaffFilterMode === 'specific' && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-white">
                  {availablePreferredStaff.length === 0 ? (
                    <div className="text-xs text-gray-500 p-2 text-center italic">
                      No preferred staff available
                    </div>
                  ) : (
                    availablePreferredStaff.map((staff) => {
                      const isSelected = selectedPreferredStaff.includes(staff.id);
                      
                      return (
                        <DropdownMenuItem
                          key={staff.id}
                          onClick={() => handleStaffToggle(staff.id)}
                          className="flex items-center space-x-2 hover:bg-blue-50 cursor-pointer text-xs p-1 rounded transition-colors duration-150"
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center border border-gray-300 rounded transition-colors duration-150",
                            isSelected && "bg-blue-600 border-blue-600"
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="truncate flex-1" title={staff.name}>
                            {staff.name}
                          </span>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            
            <DropdownMenuSeparator />

            {/* Section 3: No Preferred Staff */}
            <div className="p-2 bg-orange-50">
              <div className="text-xs font-semibold text-orange-800 mb-1">UNASSIGNED TASKS ONLY</div>
              <DropdownMenuItem
                onClick={() => handleModeChange('none')}
                className={cn(
                  "flex items-center space-x-3 hover:bg-orange-100 cursor-pointer rounded p-2 transition-colors duration-200",
                  preferredStaffFilterMode === 'none' && "bg-orange-200 border border-orange-400"
                )}
              >
                
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center border-2 rounded-full",
                  preferredStaffFilterMode === 'none' ? "bg-orange-600 border-orange-600" : "border-orange-400"
                )}>
                  {preferredStaffFilterMode === 'none' && <Check className="h-3 w-3 text-white" />}
                </div>
                <UserX className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <div className="font-medium text-orange-800">Unassigned Tasks</div>
                  <div className="text-xs text-orange-600">Shows only tasks without preferred staff</div>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Enhanced User Experience Component */}
        <UserExperienceEnhancer
          currentMode={preferredStaffFilterMode}
          selectedCount={selectedPreferredStaff.length}
          totalCount={availablePreferredStaff.length}
          onModeChange={handleModeChange}
          showGuidance={!isTransitioning}
        />

        {/* Edge Case Handler for Specific Scenarios */}
        {scenario === 'empty-selection' && (
          <EdgeCaseHandler
            scenario="empty-selection"
            staffCount={availablePreferredStaff.length}
            selectedCount={selectedPreferredStaff.length}
            className="mt-2"
          />
        )}
      </div>
    </PerformanceOptimizer>
  );
};

export default PreferredStaffFilterEnhancedPhase3;
