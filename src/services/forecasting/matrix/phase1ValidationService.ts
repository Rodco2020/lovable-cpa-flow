
/**
 * Phase 1: Validation Service
 * 
 * Main service for running all Phase 1 validation tests
 * and providing a comprehensive report
 */

import { PipelineValidator, PipelineValidationResult } from '../demand/dataFetcher/integration/pipelineValidator';
import { ComponentIntegrationTester, ComponentIntegrationResult } from '@/components/forecasting/matrix/hooks/useMatrixControls/integration/integrationTester';

export interface Phase1ValidationReport {
  phase: 'Phase 1: Integration Verification & Data Pipeline Testing';
  timestamp: string;
  duration: number;
  overallSuccess: boolean;
  pipelineValidation: PipelineValidationResult;
  componentIntegration: ComponentIntegrationResult;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningsCount: number;
    errorsCount: number;
  };
  recommendations: string[];
  nextSteps: string[];
}

/**
 * Phase 1: Validation Service
 * Coordinates all validation activities for Phase 1
 */
export class Phase1ValidationService {
  /**
   * Run complete Phase 1 validation
   */
  static async runPhase1Validation(): Promise<Phase1ValidationReport> {
    const startTime = Date.now();
    console.log('🚀 [PHASE 1 VALIDATION] Starting comprehensive Phase 1 validation...');

    const report: Phase1ValidationReport = {
      phase: 'Phase 1: Integration Verification & Data Pipeline Testing',
      timestamp: new Date().toISOString(),
      duration: 0,
      overallSuccess: false,
      pipelineValidation: {} as PipelineValidationResult,
      componentIntegration: {} as ComponentIntegrationResult,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warningsCount: 0,
        errorsCount: 0
      },
      recommendations: [],
      nextSteps: []
    };

    try {
      // Run pipeline validation
      console.log('🔍 [PHASE 1 VALIDATION] Running data pipeline validation...');
      report.pipelineValidation = await PipelineValidator.validateDataPipeline();

      // Run component integration testing with mock data
      console.log('🔍 [PHASE 1 VALIDATION] Running component integration testing...');
      const mockData = this.createMockMatrixData();
      const mockControlsState = this.createMockControlsState();
      const mockFilteringResult = { dataPoints: mockData.dataPoints };
      
      report.componentIntegration = ComponentIntegrationTester.validateComponentIntegration(
        mockData,
        mockControlsState,
        mockFilteringResult
      );

      // Calculate summary
      this.calculateSummary(report);
      
      // Generate recommendations
      this.generateRecommendations(report);
      
      // Generate next steps
      this.generateNextSteps(report);
      
      // Calculate duration
      report.duration = Date.now() - startTime;
      
      // Determine overall success
      report.overallSuccess = report.pipelineValidation.success && 
                              report.componentIntegration.success &&
                              report.summary.errorsCount === 0;

      console.log('✅ [PHASE 1 VALIDATION] Phase 1 validation completed:', {
        duration: `${report.duration}ms`,
        overallSuccess: report.overallSuccess,
        summary: report.summary
      });

      return report;

    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATION] Critical validation error:', error);
      
      report.duration = Date.now() - startTime;
      report.overallSuccess = false;
      report.summary.errorsCount += 1;
      report.recommendations.push('Critical error occurred during validation - investigate immediately');
      
      return report;
    }
  }

  /**
   * Create mock matrix data for testing
   */
  private static createMockMatrixData() {
    return {
      months: [
        { key: '2025-01', label: 'Jan 2025' },
        { key: '2025-02', label: 'Feb 2025' }
      ],
      skills: ['Tax Preparation', 'Advisory', 'Audit'],
      dataPoints: [
        {
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 100,
          taskCount: 3,
          clientCount: 2,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Client A',
              recurringTaskId: 'task-1',
              taskName: 'Tax Return',
              skillType: 'Tax Preparation',
              estimatedHours: 20,
              monthlyHours: 20,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-1',
                staffName: 'John Doe',
                roleTitle: 'Senior CPA',
                assignmentType: 'preferred' as const
              }
            },
            {
              clientId: 'client-2',
              clientName: 'Client B',
              recurringTaskId: 'task-2',
              taskName: 'Tax Advisory',
              skillType: 'Tax Preparation',
              estimatedHours: 15,
              monthlyHours: 15,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-2',
                staffName: 'Jane Smith',
                roleTitle: 'CPA',
                assignmentType: 'preferred' as const
              }
            },
            {
              clientId: 'client-1',
              clientName: 'Client A',
              recurringTaskId: 'task-3',
              taskName: 'Unassigned Task',
              skillType: 'Tax Preparation',
              estimatedHours: 10,
              monthlyHours: 10,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
              // No preferred staff
            }
          ]
        }
      ],
      totalDemand: 100,
      totalTasks: 3,
      totalClients: 2,
      skillSummary: {}
    };
  }

  /**
   * Create mock controls state for testing
   */
  private static createMockControlsState() {
    return {
      preferredStaffFilterMode: 'all' as const,
      selectedPreferredStaff: ['staff-1'],
      isAllPreferredStaffSelected: false,
      selectedSkills: ['Tax Preparation'],
      selectedClients: ['client-1'],
      isAllSkillsSelected: false,
      isAllClientsSelected: false,
      onPreferredStaffToggle: () => {},
      onPreferredStaffFilterModeChange: () => {},
      onSkillToggle: () => {},
      onClientToggle: () => {}
    };
  }

  /**
   * Calculate summary statistics
   */
  private static calculateSummary(report: Phase1ValidationReport): void {
    const pipelineTests = Object.values(report.pipelineValidation.dataIntegrity || {}).length +
                         Object.values(report.pipelineValidation.filteringLogic || {}).length +
                         Object.values(report.pipelineValidation.backwardCompatibility || {}).length;

    const componentTests = Object.values(report.componentIntegration.matrixControlsIntegration || {}).length +
                          Object.values(report.componentIntegration.filteringIntegration || {}).length +
                          Object.values(report.componentIntegration.dataFlowValidation || {}).length;

    const totalTests = pipelineTests + componentTests;
    
    const pipelinePassed = Object.values(report.pipelineValidation.dataIntegrity || {}).filter(Boolean).length +
                          Object.values(report.pipelineValidation.filteringLogic || {}).filter(Boolean).length +
                          Object.values(report.pipelineValidation.backwardCompatibility || {}).filter(Boolean).length;

    const componentPassed = Object.values(report.componentIntegration.matrixControlsIntegration || {}).filter(Boolean).length +
                           Object.values(report.componentIntegration.filteringIntegration || {}).filter(Boolean).length +
                           Object.values(report.componentIntegration.dataFlowValidation || {}).filter(Boolean).length;

    const passedTests = pipelinePassed + componentPassed;
    const failedTests = totalTests - passedTests;

    const errorsCount = (report.pipelineValidation.errors?.length || 0) +
                       (report.componentIntegration.errors?.length || 0);

    const warningsCount = (report.pipelineValidation.warnings?.length || 0) +
                         (report.componentIntegration.warnings?.length || 0);

    report.summary = {
      totalTests,
      passedTests,
      failedTests,
      warningsCount,
      errorsCount
    };
  }

  /**
   * Generate recommendations based on validation results
   */
  private static generateRecommendations(report: Phase1ValidationReport): void {
    const recommendations: string[] = [];

    // Data pipeline recommendations
    if (!report.pipelineValidation.success) {
      recommendations.push('Data pipeline validation failed - review database connectivity and data integrity');
    }

    if (report.pipelineValidation.errors?.length > 0) {
      recommendations.push(`Address ${report.pipelineValidation.errors.length} critical data pipeline errors`);
    }

    // Component integration recommendations
    if (!report.componentIntegration.success) {
      recommendations.push('Component integration validation failed - review three-mode filtering logic');
    }

    if (report.componentIntegration.errors?.length > 0) {
      recommendations.push(`Fix ${report.componentIntegration.errors.length} component integration issues`);
    }

    // Performance recommendations
    if (report.duration > 5000) {
      recommendations.push('Validation took longer than expected - consider optimizing data queries');
    }

    // General recommendations
    if (report.summary.failedTests > 0) {
      recommendations.push(`${report.summary.failedTests} tests failed - review implementation before proceeding to Phase 2`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All Phase 1 validations passed - ready to proceed to Phase 2');
    }

    report.recommendations = recommendations;
  }

  /**
   * Generate next steps based on validation results
   */
  private static generateNextSteps(report: Phase1ValidationReport): void {
    const nextSteps: string[] = [];

    if (report.overallSuccess) {
      nextSteps.push('✅ Phase 1 completed successfully');
      nextSteps.push('🚀 Ready to proceed to Phase 2: Enhanced UI Implementation');
      nextSteps.push('📋 Review Phase 2 requirements and deliverables');
      nextSteps.push('🔧 Begin implementing three-mode toggle interface');
    } else {
      nextSteps.push('❌ Phase 1 validation failed');
      nextSteps.push('🔍 Review and fix identified issues');
      nextSteps.push('🔄 Re-run Phase 1 validation');
      nextSteps.push('⏸️ Do not proceed to Phase 2 until all issues are resolved');
    }

    // Specific next steps based on failures
    if (report.pipelineValidation.errors?.length > 0) {
      nextSteps.push('🗄️ Fix database connectivity and data integrity issues');
    }

    if (report.componentIntegration.errors?.length > 0) {
      nextSteps.push('🔧 Fix component integration and three-mode logic issues');
    }

    report.nextSteps = nextSteps;
  }

  /**
   * Generate a human-readable report summary
   */
  static generateReportSummary(report: Phase1ValidationReport): string {
    return `
🔍 PHASE 1 VALIDATION REPORT
============================

Phase: ${report.phase}
Timestamp: ${new Date(report.timestamp).toLocaleString()}
Duration: ${report.duration}ms
Overall Success: ${report.overallSuccess ? '✅ PASSED' : '❌ FAILED'}

📊 SUMMARY STATISTICS
- Total Tests: ${report.summary.totalTests}
- Passed Tests: ${report.summary.passedTests}
- Failed Tests: ${report.summary.failedTests}
- Warnings: ${report.summary.warningsCount}
- Errors: ${report.summary.errorsCount}

🔧 DATA PIPELINE VALIDATION
- Success: ${report.pipelineValidation.success ? '✅' : '❌'}
- Preferred Staff Data: ${report.pipelineValidation.dataIntegrity?.preferredStaffDataLoaded ? '✅' : '❌'}
- Recurring Tasks: ${report.pipelineValidation.dataIntegrity?.recurringTasksLoaded ? '✅' : '❌'}
- Clients Data: ${report.pipelineValidation.dataIntegrity?.clientsLoaded ? '✅' : '❌'}
- Skills Data: ${report.pipelineValidation.dataIntegrity?.skillsLoaded ? '✅' : '❌'}

🔄 FILTERING LOGIC VALIDATION
- All Mode: ${report.pipelineValidation.filteringLogic?.allModeWorking ? '✅' : '❌'}
- Specific Mode: ${report.pipelineValidation.filteringLogic?.specificModeWorking ? '✅' : '❌'}
- None Mode: ${report.pipelineValidation.filteringLogic?.noneModeWorking ? '✅' : '❌'}

⚡ COMPONENT INTEGRATION
- Success: ${report.componentIntegration.success ? '✅' : '❌'}
- Three-Mode State: ${report.componentIntegration.matrixControlsIntegration?.threeModeStateManagement ? '✅' : '❌'}
- Parameter Passing: ${report.componentIntegration.matrixControlsIntegration?.parameterPassing ? '✅' : '❌'}
- Data Flow: ${report.componentIntegration.dataFlowValidation?.controlsToFilteringFlow ? '✅' : '❌'}

🔍 BACKWARD COMPATIBILITY
- Existing Filters: ${report.pipelineValidation.backwardCompatibility?.existingFiltersWorking ? '✅' : '❌'}
- Export Functionality: ${report.pipelineValidation.backwardCompatibility?.exportFunctionalityIntact ? '✅' : '❌'}
- Matrix Consistency: ${report.pipelineValidation.backwardCompatibility?.matrixDataConsistent ? '✅' : '❌'}

💡 RECOMMENDATIONS
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

🚀 NEXT STEPS
${report.nextSteps.map(step => `- ${step}`).join('\n')}
`;
  }
}
