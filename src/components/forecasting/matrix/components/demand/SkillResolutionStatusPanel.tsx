
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { SkillResolutionLogger } from '@/services/forecasting/matrix/skillResolutionLogger';
import type { SkillResolutionDiagnostics } from '@/services/forecasting/matrix/skillResolutionLogger';

interface SkillResolutionStatusPanelProps {
  resolvedSkills: string[];
  unresolvedSkills: string[];
  errors: Record<string, string>;
  isLoading: boolean;
  onRetryResolution?: () => void;
  onViewDetails?: () => void;
  showDiagnostics?: boolean;
}

/**
 * Phase 4: Skill Resolution Status Panel Component
 * 
 * PHASE 4 ENHANCEMENTS:
 * - Comprehensive status display for skill resolution
 * - User-friendly error reporting and diagnostics
 * - Performance monitoring and analytics
 * - Actionable buttons for resolution retry
 * - Development diagnostics panel
 */
export const SkillResolutionStatusPanel: React.FC<SkillResolutionStatusPanelProps> = ({
  resolvedSkills,
  unresolvedSkills,
  errors,
  isLoading,
  onRetryResolution,
  onViewDetails,
  showDiagnostics = false
}) => {
  const [diagnostics, setDiagnostics] = React.useState<SkillResolutionDiagnostics | null>(null);
  const [showFullDiagnostics, setShowFullDiagnostics] = React.useState(false);

  // Load diagnostics when component mounts or when showDiagnostics changes
  React.useEffect(() => {
    if (showDiagnostics) {
      const diag = SkillResolutionLogger.generateDiagnostics();
      setDiagnostics(diag);
    }
  }, [showDiagnostics, resolvedSkills.length, unresolvedSkills.length]);

  const totalSkills = resolvedSkills.length + unresolvedSkills.length;
  const errorCount = Object.keys(errors).length;
  const performanceSummary = SkillResolutionLogger.getPerformanceSummary();

  // Phase 4: Determine overall status
  const getOverallStatus = () => {
    if (isLoading) return 'loading';
    if (unresolvedSkills.length > 0 || errorCount > 0) return 'warning';
    if (totalSkills > 0) return 'success';
    return 'empty';
  };

  const status = getOverallStatus();

  // Phase 4: Export diagnostics function
  const handleExportDiagnostics = () => {
    const exportData = SkillResolutionLogger.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skill-resolution-diagnostics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  console.log('🎯 [PHASE 4 STATUS] Skill resolution status panel:', {
    totalSkills,
    resolvedCount: resolvedSkills.length,
    unresolvedCount: unresolvedSkills.length,
    errorCount,
    status,
    isLoading
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {status === 'loading' && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
            {status === 'empty' && <Clock className="h-5 w-5 text-gray-500" />}
            Skill Resolution Status
          </div>
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                Details
              </Button>
            )}
            {showDiagnostics && (
              <Button variant="outline" size="sm" onClick={handleExportDiagnostics}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Phase 4: Loading state */}
        {isLoading && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Resolving skill information... This may take a few moments.
            </AlertDescription>
          </Alert>
        )}

        {/* Phase 4: Main status display */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Resolved Skills */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {resolvedSkills.length}
              </div>
              <div className="text-sm text-green-600">Resolved Skills</div>
              <Badge variant="outline" className="mt-2 bg-green-100">
                {totalSkills > 0 ? Math.round((resolvedSkills.length / totalSkills) * 100) : 0}%
              </Badge>
            </div>

            {/* Unresolved Skills */}
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-700">
                {unresolvedSkills.length}
              </div>
              <div className="text-sm text-amber-600">Unresolved Skills</div>
              {unresolvedSkills.length > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Needs Attention
                </Badge>
              )}
            </div>

            {/* Errors */}
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {errorCount}
              </div>
              <div className="text-sm text-red-600">Resolution Errors</div>
              {errorCount > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Critical
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Phase 4: Error details */}
        {errorCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Skill Resolution Errors:</div>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {Object.entries(errors).slice(0, 5).map(([skill, error]) => (
                  <div key={skill} className="flex justify-between items-start gap-2">
                    <span className="font-mono text-xs bg-red-100 px-1 rounded">{skill}</span>
                    <span className="text-xs flex-1">{error}</span>
                  </div>
                ))}
                {Object.keys(errors).length > 5 && (
                  <div className="text-xs text-red-500 italic">
                    ...and {Object.keys(errors).length - 5} more errors
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Phase 4: Unresolved skills list */}
        {unresolvedSkills.length > 0 && unresolvedSkills.length <= 10 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Unresolved Skills:</div>
              <div className="flex flex-wrap gap-1">
                {unresolvedSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Phase 4: Performance summary */}
        {showDiagnostics && diagnostics && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Performance Summary</span>
              <Badge 
                variant={performanceSummary.status === 'good' ? 'default' : 
                       performanceSummary.status === 'warning' ? 'destructive' : 'destructive'}
              >
                {performanceSummary.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-blue-800 mb-2">{performanceSummary.summary}</div>
            <div className="space-y-1 text-xs text-blue-700">
              {performanceSummary.details.map((detail, index) => (
                <div key={index}>• {detail}</div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 4: Action buttons */}
        {!isLoading && (unresolvedSkills.length > 0 || errorCount > 0) && onRetryResolution && (
          <div className="flex justify-center">
            <Button onClick={onRetryResolution} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Skill Resolution
            </Button>
          </div>
        )}

        {/* Phase 4: Detailed diagnostics (collapsible) */}
        {showDiagnostics && diagnostics && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDiagnostics(!showFullDiagnostics)}
              className="w-full"
            >
              {showFullDiagnostics ? 'Hide' : 'Show'} Detailed Diagnostics
            </Button>
            
            {showFullDiagnostics && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <div className="font-medium">Total Operations</div>
                    <div>{diagnostics.totalOperations}</div>
                  </div>
                  <div>
                    <div className="font-medium">Success Rate</div>
                    <div>{diagnostics.totalOperations > 0 ? 
                      Math.round((diagnostics.successfulOperations / diagnostics.totalOperations) * 100) : 0}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Avg Duration</div>
                    <div>{diagnostics.averageDuration}ms</div>
                  </div>
                  <div>
                    <div className="font-medium">Cache Hit Rate</div>
                    <div>{diagnostics.performanceMetrics.cacheHitRate}%</div>
                  </div>
                </div>
                
                {Object.keys(diagnostics.commonErrors).length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Common Errors:</div>
                    {Object.entries(diagnostics.commonErrors).map(([error, count]) => (
                      <div key={error} className="flex justify-between">
                        <span className="truncate flex-1">{error}</span>
                        <span>{count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillResolutionStatusPanel;
