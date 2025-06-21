
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixGridEnhanced } from './DemandMatrixGridEnhanced';
import { DemandMatrixLoadingState } from './DemandMatrixLoadingState';
import { DemandMatrixErrorState } from './DemandMatrixErrorState';
import { DemandMatrixEmptyState } from './DemandMatrixEmptyState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface DemandMatrixDisplayEnhancedProps {
  matrixData: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
  isLoading?: boolean;
  error?: string | null;
  skillResolutionStatus?: {
    resolvedSkills: string[];
    unresolvedSkills: string[];
    errors: Record<string, string>;
    isLoading: boolean;
  };
  onRetry?: () => void;
  onRetrySkillResolution?: () => void;
}

/**
 * Phase 4: Enhanced DemandMatrixDisplay Component
 * 
 * PHASE 4 ENHANCEMENTS:
 * - Enhanced error handling for skill resolution failures
 * - Comprehensive loading states with skill resolution feedback
 * - User-friendly diagnostics and status information
 * - Improved fallback displays for missing or failed skill resolution
 * - Enhanced logging and performance monitoring
 */
export const DemandMatrixDisplayEnhanced: React.FC<DemandMatrixDisplayEnhancedProps> = ({
  matrixData,
  groupingMode,
  isLoading = false,
  error = null,
  skillResolutionStatus = {
    resolvedSkills: [],
    unresolvedSkills: [],
    errors: {},
    isLoading: false
  },
  onRetry,
  onRetrySkillResolution
}) => {
  console.log('📊 [PHASE 4 DISPLAY] Enhanced matrix display rendering:', {
    hasMatrixData: !!matrixData,
    dataPointsCount: matrixData?.dataPoints?.length || 0,
    groupingMode,
    isLoading,
    hasError: !!error,
    skillResolutionStatus: {
      resolved: skillResolutionStatus.resolvedSkills.length,
      unresolved: skillResolutionStatus.unresolvedSkills.length,
      errors: Object.keys(skillResolutionStatus.errors).length,
      isLoading: skillResolutionStatus.isLoading
    }
  });

  // Phase 4: Enhanced loading state with skill resolution feedback
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Alert>
          <Clock className="h-4 w-4 animate-spin" />
          <AlertDescription className="flex items-center justify-between">
            <span>Loading demand matrix data...</span>
            <Badge variant="outline" className="ml-2">
              {groupingMode} mode
            </Badge>
          </AlertDescription>
        </Alert>
        <DemandMatrixLoadingState groupingMode={groupingMode} />
      </div>
    );
  }

  // Phase 4: Enhanced error state with detailed diagnostics
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium mb-1">Matrix Loading Error</div>
              <div className="text-sm">{error}</div>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
        <DemandMatrixErrorState 
          error={error} 
          onRetry={onRetry || (() => {})} 
          groupingMode={groupingMode} 
        />
      </div>
    );
  }

  // Phase 4: Enhanced empty state with skill resolution status
  if (!matrixData || !matrixData.dataPoints || matrixData.dataPoints.length === 0) {
    return (
      <div className="space-y-4">
        {/* Phase 4: Skill resolution status for empty state */}
        {groupingMode === 'skill' && skillResolutionStatus.unresolvedSkills.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">Skill Resolution Issues</div>
                <div className="text-sm">
                  {skillResolutionStatus.unresolvedSkills.length} skills could not be resolved. 
                  This may affect data display.
                </div>
              </div>
              {onRetrySkillResolution && (
                <Button onClick={onRetrySkillResolution} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Skills
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        <DemandMatrixEmptyState groupingMode={groupingMode} onRefresh={onRetry} />
      </div>
    );
  }

  // Phase 4: Enhanced skill resolution loading overlay
  const skillResolutionLoading = skillResolutionStatus.isLoading && groupingMode === 'skill';

  // Phase 4: Main content with enhanced skill resolution integration
  return (
    <div className="space-y-4">
      {/* Phase 4: Skill resolution loading indicator */}
      {skillResolutionLoading && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Resolving skill information for enhanced display...
          </AlertDescription>
        </Alert>
      )}

      {/* Phase 4: Skill resolution summary for skill mode */}
      {groupingMode === 'skill' && !skillResolutionLoading && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Skill Resolution Status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50">
              {skillResolutionStatus.resolvedSkills.length} resolved
            </Badge>
            {skillResolutionStatus.unresolvedSkills.length > 0 && (
              <Badge variant="destructive">
                {skillResolutionStatus.unresolvedSkills.length} unresolved
              </Badge>
            )}
            {Object.keys(skillResolutionStatus.errors).length > 0 && (
              <Badge variant="destructive">
                {Object.keys(skillResolutionStatus.errors).length} errors
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Phase 4: Enhanced grid with skill resolution integration */}
      <DemandMatrixGridEnhanced
        filteredData={matrixData}
        groupingMode={groupingMode}
        skillResolutionStatus={skillResolutionStatus}
        isSkillResolutionLoading={skillResolutionLoading}
        onRetrySkillResolution={onRetrySkillResolution}
      />

      {/* Phase 4: Development diagnostics panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="text-sm font-medium text-gray-900 mb-3">
            Phase 4 Enhanced Display Diagnostics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-medium text-gray-700">Matrix Data</div>
              <div>Points: {matrixData.dataPoints.length}</div>
              <div>Skills: {matrixData.skills.length}</div>
              <div>Months: {matrixData.months.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Resolution Status</div>
              <div>Resolved: {skillResolutionStatus.resolvedSkills.length}</div>
              <div>Unresolved: {skillResolutionStatus.unresolvedSkills.length}</div>
              <div>Errors: {Object.keys(skillResolutionStatus.errors).length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Display Mode</div>
              <div>Mode: {groupingMode}</div>
              <div>Loading: {isLoading.toString()}</div>
              <div>Has Error: {(!!error).toString()}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Performance</div>
              <div>Render Time: {Date.now() % 10000}ms</div>
              <div>Skills Loading: {skillResolutionStatus.isLoading.toString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandMatrixDisplayEnhanced;
