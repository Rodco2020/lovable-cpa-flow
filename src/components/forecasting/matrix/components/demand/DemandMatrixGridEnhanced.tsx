
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixCellEnhanced } from './DemandMatrixCellEnhanced';
import { GridHeader } from './components/GridHeader';
import { ClientSummaryRow } from './components/ClientSummaryRow';
import { GrandTotalRow } from './components/GrandTotalRow';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { 
  getAggregatedDataForClient, 
  getDataPointForSkill
} from './utils/gridDataUtils';
import { getClientValues } from './utils/gridCalculationUtils';
import { getRowLabel, calculateGridTemplateRows, logMatrixRendering } from './utils/gridLayoutUtils';
import { useDemandMatrixGrid } from './hooks/useDemandMatrixGrid';

interface DemandMatrixGridEnhancedProps {
  filteredData: DemandMatrixData;
  groupingMode: 'skill' | 'client';
  skillResolutionStatus?: {
    resolvedSkills: string[];
    unresolvedSkills: string[];
    errors: Record<string, string>;
  };
  isSkillResolutionLoading?: boolean;
  onRetrySkillResolution?: () => void;
}

/**
 * Phase 4: Enhanced DemandMatrixGrid Component
 * 
 * PHASE 4 ENHANCEMENTS:
 * - Enhanced display of resolved skill information
 * - Comprehensive error handling for skill resolution failures
 * - User-friendly feedback for skill resolution status
 * - Enhanced logging and diagnostics
 * - Performance optimizations for skill resolution display
 */
export const DemandMatrixGridEnhanced: React.FC<DemandMatrixGridEnhancedProps> = ({
  filteredData,
  groupingMode,
  skillResolutionStatus = {
    resolvedSkills: [],
    unresolvedSkills: [],
    errors: {}
  },
  isSkillResolutionLoading = false,
  onRetrySkillResolution
}) => {
  // Use custom hook for grid logic and calculations
  const {
    rowItems,
    gridTemplateColumns,
    grandTotals,
    additionalRows,
    clientTotals,
    clientRevenue,
    clientHourlyRates,
    clientSuggestedRevenue,
    clientExpectedLessSuggested
  } = useDemandMatrixGrid({ filteredData, groupingMode });

  // Phase 4: Enhanced logging with skill resolution status
  console.log('🚀 [PHASE 4 GRID] Enhanced matrix grid rendering:', {
    groupingMode,
    rowItemsCount: rowItems.length,
    monthsCount: filteredData.months.length,
    skillResolutionStatus: {
      resolved: skillResolutionStatus.resolvedSkills.length,
      unresolved: skillResolutionStatus.unresolvedSkills.length,
      errors: Object.keys(skillResolutionStatus.errors).length
    },
    isSkillResolutionLoading
  });

  // Phase 4: Helper function to check if skill is resolved
  const isSkillResolved = (skillName: string): boolean => {
    if (groupingMode !== 'skill') return true;
    return skillResolutionStatus.resolvedSkills.includes(skillName);
  };

  // Phase 4: Helper function to get skill resolution error
  const getSkillResolutionError = (skillName: string): string | null => {
    if (groupingMode !== 'skill') return null;
    return skillResolutionStatus.errors[skillName] || null;
  };

  // Phase 4: Render skill resolution status indicator
  const renderSkillResolutionStatus = () => {
    if (groupingMode !== 'skill') return null;

    const totalSkills = skillResolutionStatus.resolvedSkills.length + skillResolutionStatus.unresolvedSkills.length;
    const unresolvedCount = skillResolutionStatus.unresolvedSkills.length;
    const errorCount = Object.keys(skillResolutionStatus.errors).length;

    if (isSkillResolutionLoading) {
      return (
        <Alert className="mb-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription className="flex items-center gap-2">
            Resolving skill information...
            <Badge variant="outline">{totalSkills} skills</Badge>
          </AlertDescription>
        </Alert>
      );
    }

    if (unresolvedCount > 0 || errorCount > 0) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Skill resolution issues detected:</span>
              {unresolvedCount > 0 && (
                <Badge variant="destructive">{unresolvedCount} unresolved</Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">{errorCount} errors</Badge>
              )}
            </div>
            {onRetrySkillResolution && (
              <button
                onClick={onRetrySkillResolution}
                className="text-sm underline hover:no-underline"
              >
                Retry Resolution
              </button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (totalSkills > 0) {
      return (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center gap-2">
            <span>All skills resolved successfully</span>
            <Badge variant="outline" className="bg-green-50">
              {totalSkills} skills
            </Badge>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div>
      {/* Phase 4: Skill resolution status display */}
      {renderSkillResolutionStatus()}

      <div className="overflow-x-auto">
        <div 
          className="grid gap-1 min-w-fit"
          style={{
            gridTemplateColumns,
            gridTemplateRows: calculateGridTemplateRows(rowItems.length, additionalRows)
          }}
        >
          {/* Grid Headers */}
          <GridHeader groupingMode={groupingMode} months={filteredData.months} />
          
          {/* Skill/Client rows */}
          {rowItems.map((skillOrClient) => (
            <React.Fragment key={skillOrClient}>
              {/* Phase 4: Enhanced row label with skill resolution status */}
              <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center justify-between sticky left-0 z-10">
                <div className="truncate" title={getRowLabel(skillOrClient)}>
                  {getRowLabel(skillOrClient)}
                </div>
                {/* Phase 4: Skill resolution indicator */}
                {groupingMode === 'skill' && (
                  <div className="ml-2 flex-shrink-0">
                    {isSkillResolved(skillOrClient) ? (
                      <Badge variant="outline" className="text-xs bg-green-50">
                        ✓
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        ?
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Phase 4: Enhanced demand cells with skill resolution status */}
              {filteredData.months.map((month) => {
                let cellData;

                if (groupingMode === 'client') {
                  cellData = getAggregatedDataForClient(skillOrClient, month.key, filteredData);
                } else {
                  cellData = getDataPointForSkill(skillOrClient, month.key, filteredData);
                }

                return (
                  <DemandMatrixCellEnhanced
                    key={`${skillOrClient}-${month.key}`}
                    skillOrClient={skillOrClient}
                    month={month.key}
                    monthLabel={month.label}
                    demandHours={cellData.demandHours}
                    taskCount={cellData.taskCount}
                    clientCount={cellData.clientCount}
                    taskBreakdown={cellData.taskBreakdown}
                    groupingMode={groupingMode}
                    skillResolutionError={getSkillResolutionError(skillOrClient)}
                    isSkillResolved={isSkillResolved(skillOrClient)}
                  />
                );
              })}

              {/* Revenue summary cells for client mode */}
              {groupingMode === 'client' && (() => {
                const clientValues = getClientValues(
                  skillOrClient,
                  clientTotals,
                  clientRevenue,
                  clientHourlyRates,
                  clientSuggestedRevenue,
                  clientExpectedLessSuggested
                );
                
                return (
                  <ClientSummaryRow
                    key={`${skillOrClient}-summary`}
                    clientName={skillOrClient}
                    totalHours={clientValues.totalHours}
                    totalRevenue={clientValues.totalRevenue}
                    hourlyRate={clientValues.hourlyRate}
                    suggestedRevenue={clientValues.suggestedRevenue}
                    expectedLessSuggested={clientValues.expectedLessSuggested}
                  />
                );
              })()}
            </React.Fragment>
          ))}

          {/* Grand total cells for client mode */}
          {groupingMode === 'client' && rowItems.length > 0 && grandTotals && (
            <GrandTotalRow 
              grandTotals={grandTotals} 
              monthsCount={filteredData.months.length} 
            />
          )}
        </div>
      </div>

      {/* Phase 4: Development diagnostics */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <div className="font-medium mb-2">Phase 4 Diagnostics:</div>
          <div>Grid Mode: {groupingMode}</div>
          <div>Row Items: {rowItems.length}</div>
          <div>Months: {filteredData.months.length}</div>
          {groupingMode === 'skill' && (
            <>
              <div>Resolved Skills: {skillResolutionStatus.resolvedSkills.length}</div>
              <div>Unresolved Skills: {skillResolutionStatus.unresolvedSkills.length}</div>
              <div>Resolution Errors: {Object.keys(skillResolutionStatus.errors).length}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DemandMatrixGridEnhanced;
