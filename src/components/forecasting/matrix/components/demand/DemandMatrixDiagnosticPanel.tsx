
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, Info, Bug } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { DataValidationService } from '@/services/forecasting/demand/dataValidationService';

interface DemandMatrixDiagnosticPanelProps {
  matrixData: DemandMatrixData | null;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isVisible?: boolean;
}

/**
 * Demand Matrix Diagnostic Panel
 * Comprehensive debugging and validation display for the demand matrix
 */
export const DemandMatrixDiagnosticPanel: React.FC<DemandMatrixDiagnosticPanelProps> = ({
  matrixData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  preferredStaffFilterMode,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  isVisible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isVisible);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!matrixData) {
    return null;
  }

  // Run validations
  const matrixValidation = DataValidationService.validateMatrixData(matrixData);
  const filterValidation = DataValidationService.validateFilterSettings({
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    preferredStaffFilterMode,
    availableSkills,
    availableClients: availableClients.map(c => c.id),
    availablePreferredStaff: availablePreferredStaff.map(s => s.id)
  });

  // Analyze suspicious data patterns
  const suspiciousDataPoints = matrixData.dataPoints.filter(point => 
    point.taskCount === 1 && point.clientCount === 1
  );

  const lowDataPoints = matrixData.dataPoints.filter(point => 
    point.demandHours > 0 && point.demandHours < 1
  );

  // Calculate coverage statistics
  const totalPossibleCombinations = matrixData.months.length * matrixData.skills.length;
  const actualDataPoints = matrixData.dataPoints.length;
  const coveragePercentage = totalPossibleCombinations > 0 
    ? Math.round((actualDataPoints / totalPossibleCombinations) * 100) 
    : 0;

  const renderValidationStatus = (validation: { isValid: boolean; issues: string[]; warnings?: string[] }) => {
    const { isValid, issues, warnings = [] } = validation;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <span className="font-medium">
            {isValid ? 'Validation Passed' : `${issues.length} Issues Found`}
          </span>
        </div>
        
        {issues.length > 0 && (
          <div className="ml-6 space-y-1">
            {issues.map((issue, index) => (
              <div key={index} className="text-sm text-red-600 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
        
        {warnings.length > 0 && (
          <div className="ml-6 space-y-1">
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-600 flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">⚠</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            Show Diagnostic Panel
            <Badge variant={matrixValidation.isValid ? "default" : "destructive"} className="ml-2">
              {matrixValidation.isValid ? 'OK' : `${matrixValidation.issues.length} Issues`}
            </Badge>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bug className="h-5 w-5 text-blue-600" />
            Demand Matrix Diagnostic Panel
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Matrix Data Overview */}
        <Collapsible 
          open={activeSection === 'overview'} 
          onOpenChange={() => setActiveSection(activeSection === 'overview' ? null : 'overview')}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
            {activeSection === 'overview' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Matrix Data Overview</span>
            <Badge variant="outline">{matrixData.dataPoints.length} data points</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 mt-2 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-xl font-bold text-blue-600">{matrixData.months.length}</div>
                <div className="text-xs text-gray-600">Months</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-xl font-bold text-green-600">{matrixData.skills.length}</div>
                <div className="text-xs text-gray-600">Skills</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-xl font-bold text-yellow-600">{matrixData.totalTasks}</div>
                <div className="text-xs text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-xl font-bold text-purple-600">{matrixData.totalClients}</div>
                <div className="text-xs text-gray-600">Total Clients</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium mb-2">Data Coverage</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${coveragePercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{coveragePercentage}%</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {actualDataPoints} of {totalPossibleCombinations} possible skill-month combinations
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Matrix Validation */}
        <Collapsible 
          open={activeSection === 'validation'} 
          onOpenChange={() => setActiveSection(activeSection === 'validation' ? null : 'validation')}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
            {activeSection === 'validation' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Matrix Data Validation</span>
            <Badge variant={matrixValidation.isValid ? "default" : "destructive"}>
              {matrixValidation.isValid ? 'Valid' : `${matrixValidation.issues.length} Issues`}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 mt-2">
            {renderValidationStatus(matrixValidation)}
          </CollapsibleContent>
        </Collapsible>

        {/* Filter Validation */}
        <Collapsible 
          open={activeSection === 'filters'} 
          onOpenChange={() => setActiveSection(activeSection === 'filters' ? null : 'filters')}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
            {activeSection === 'filters' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Filter Settings Validation</span>
            <Badge variant={filterValidation.isValid ? "default" : "destructive"}>
              {filterValidation.isValid ? 'Valid' : `${filterValidation.issues.length} Issues`}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 mt-2">
            {renderValidationStatus(filterValidation)}
            
            {filterValidation.recommendations && filterValidation.recommendations.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <div className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </div>
                {filterValidation.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Data Quality Analysis */}
        <Collapsible 
          open={activeSection === 'quality'} 
          onOpenChange={() => setActiveSection(activeSection === 'quality' ? null : 'quality')}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded">
            {activeSection === 'quality' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Data Quality Analysis</span>
            <Badge variant={suspiciousDataPoints.length > 0 ? "secondary" : "default"}>
              {suspiciousDataPoints.length} suspicious patterns
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 mt-2 space-y-3">
            {suspiciousDataPoints.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-800 mb-2">
                  ⚠️ Suspicious Data Patterns ({suspiciousDataPoints.length} found)
                </div>
                <div className="text-sm text-yellow-700">
                  Found {suspiciousDataPoints.length} data points with exactly 1 task and 1 client. 
                  This might indicate data aggregation issues.
                </div>
                {suspiciousDataPoints.slice(0, 5).map((point, index) => (
                  <div key={index} className="text-xs text-yellow-600 mt-1">
                    • {point.skillType} - {point.monthLabel}: {point.demandHours}h
                  </div>
                ))}
                {suspiciousDataPoints.length > 5 && (
                  <div className="text-xs text-yellow-600 mt-1">
                    ... and {suspiciousDataPoints.length - 5} more
                  </div>
                )}
              </div>
            )}
            
            {lowDataPoints.length > 0 && (
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-medium text-blue-800 mb-2">
                  💡 Low Demand Hours ({lowDataPoints.length} found)
                </div>
                <div className="text-sm text-blue-700">
                  Found {lowDataPoints.length} data points with very low demand hours (&lt; 1h). 
                  This might indicate recurrence calculation issues.
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Current Filter Status */}
        <div className="p-3 bg-gray-50 rounded">
          <div className="font-medium mb-2">Current Filter Status</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="font-medium">Skills:</span> {selectedSkills.length}/{availableSkills.length} selected
            </div>
            <div>
              <span className="font-medium">Clients:</span> {selectedClients.length}/{availableClients.length} selected
            </div>
            <div>
              <span className="font-medium">Staff Mode:</span> {preferredStaffFilterMode}
              {preferredStaffFilterMode === 'specific' && ` (${selectedPreferredStaff.length} selected)`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemandMatrixDiagnosticPanel;
