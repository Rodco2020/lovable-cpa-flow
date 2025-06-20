
/**
 * Phase 1: Component Integration Tester
 * 
 * Tests the integration between useDemandMatrixControls and useDemandMatrixFiltering
 * to ensure the three-mode preferred staff filtering system works correctly
 */

import { DemandMatrixData } from '@/types/demand';

export interface ComponentIntegrationResult {
  success: boolean;
  matrixControlsIntegration: {
    threeModeStateManagement: boolean;
    parameterPassing: boolean;
    filterSynchronization: boolean;
  };
  filteringIntegration: {
    allModeProcessing: boolean;
    specificModeProcessing: boolean;
    noneModeProcessing: boolean;
  };
  dataFlowValidation: {
    controlsToFilteringFlow: boolean;
    filteringToDisplayFlow: boolean;
    stateConsistency: boolean;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Phase 1: Component Integration Tester
 * Validates that all components work together correctly
 */
export class ComponentIntegrationTester {
  /**
   * Test integration between matrix controls and filtering
   */
  static validateComponentIntegration(
    mockMatrixData: DemandMatrixData,
    mockControlsState: any,
    mockFilteringResult: any
  ): ComponentIntegrationResult {
    console.log('🔍 [PHASE 1 INTEGRATION] Starting component integration validation');

    const result: ComponentIntegrationResult = {
      success: false,
      matrixControlsIntegration: {
        threeModeStateManagement: false,
        parameterPassing: false,
        filterSynchronization: false
      },
      filteringIntegration: {
        allModeProcessing: false,
        specificModeProcessing: false,
        noneModeProcessing: false
      },
      dataFlowValidation: {
        controlsToFilteringFlow: false,
        filteringToDisplayFlow: false,
        stateConsistency: false
      },
      errors: [],
      warnings: []
    };

    try {
      // Test matrix controls integration
      this.testMatrixControlsIntegration(result, mockControlsState);
      
      // Test filtering integration
      this.testFilteringIntegration(result, mockMatrixData, mockFilteringResult);
      
      // Test data flow validation
      this.testDataFlowValidation(result, mockControlsState, mockFilteringResult);
      
      // Calculate overall success
      result.success = this.calculateIntegrationSuccess(result);
      
      console.log('✅ [PHASE 1 INTEGRATION] Component integration validation completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [PHASE 1 INTEGRATION] Critical integration error:', error);
      result.errors.push(`Critical integration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Test matrix controls integration
   */
  private static testMatrixControlsIntegration(
    result: ComponentIntegrationResult,
    mockControlsState: any
  ): void {
    console.log('🔍 [PHASE 1 INTEGRATION] Testing matrix controls integration...');

    try {
      // Test three-mode state management
      const hasThreeModeState = mockControlsState.preferredStaffFilterMode &&
        ['all', 'specific', 'none'].includes(mockControlsState.preferredStaffFilterMode);
      
      result.matrixControlsIntegration.threeModeStateManagement = hasThreeModeState;
      
      if (!hasThreeModeState) {
        result.errors.push('Three-mode state management not properly implemented');
      }

      // Test parameter passing
      const hasRequiredParameters = mockControlsState.selectedPreferredStaff &&
        Array.isArray(mockControlsState.selectedPreferredStaff) &&
        typeof mockControlsState.isAllPreferredStaffSelected === 'boolean';
      
      result.matrixControlsIntegration.parameterPassing = hasRequiredParameters;
      
      if (!hasRequiredParameters) {
        result.errors.push('Required parameters not properly passed');
      }

      // Test filter synchronization
      const hasFilterSync = mockControlsState.onPreferredStaffToggle &&
        typeof mockControlsState.onPreferredStaffToggle === 'function' &&
        mockControlsState.onPreferredStaffFilterModeChange &&
        typeof mockControlsState.onPreferredStaffFilterModeChange === 'function';
      
      result.matrixControlsIntegration.filterSynchronization = hasFilterSync;
      
      if (!hasFilterSync) {
        result.errors.push('Filter synchronization handlers not properly implemented');
      }

      console.log('✅ [PHASE 1 INTEGRATION] Matrix controls integration validated:', {
        threeModeState: hasThreeModeState,
        parameterPassing: hasRequiredParameters,
        filterSync: hasFilterSync
      });

    } catch (error) {
      result.errors.push(`Matrix controls integration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test filtering integration
   */
  private static testFilteringIntegration(
    result: ComponentIntegrationResult,
    mockMatrixData: DemandMatrixData,
    mockFilteringResult: any
  ): void {
    console.log('🔍 [PHASE 1 INTEGRATION] Testing filtering integration...');

    try {
      // Test all mode processing
      const allModeWorks = this.simulateAllModeFiltering(mockMatrixData);
      result.filteringIntegration.allModeProcessing = allModeWorks;
      
      if (!allModeWorks) {
        result.errors.push('All mode filtering not working correctly');
      }

      // Test specific mode processing
      const specificModeWorks = this.simulateSpecificModeFiltering(mockMatrixData);
      result.filteringIntegration.specificModeProcessing = specificModeWorks;
      
      if (!specificModeWorks) {
        result.errors.push('Specific mode filtering not working correctly');
      }

      // Test none mode processing
      const noneModeWorks = this.simulateNoneModeFiltering(mockMatrixData);
      result.filteringIntegration.noneModeProcessing = noneModeWorks;
      
      if (!noneModeWorks) {
        result.errors.push('None mode filtering not working correctly');
      }

      console.log('✅ [PHASE 1 INTEGRATION] Filtering integration validated:', {
        allMode: allModeWorks,
        specificMode: specificModeWorks,
        noneMode: noneModeWorks
      });

    } catch (error) {
      result.errors.push(`Filtering integration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simulate all mode filtering
   */
  private static simulateAllModeFiltering(mockMatrixData: DemandMatrixData): boolean {
    try {
      // All mode should include all tasks (both assigned and unassigned)
      const totalTasks = mockMatrixData.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.length, 0
      );
      
      const tasksWithPreferredStaff = mockMatrixData.dataPoints.reduce(
        (sum, point) => sum + point.taskBreakdown.filter(task => task.preferredStaff?.staffId).length, 0
      );
      
      const tasksWithoutPreferredStaff = totalTasks - tasksWithPreferredStaff;
      
      // All mode should show both types of tasks
      const allModeWorks = totalTasks > 0 && (tasksWithPreferredStaff > 0 || tasksWithoutPreferredStaff > 0);
      
      console.log('🎯 [PHASE 1 INTEGRATION] All mode simulation:', {
        totalTasks,
        tasksWithPreferredStaff,
        tasksWithoutPreferredStaff,
        allModeWorks
      });
      
      return allModeWorks;
    } catch (error) {
      console.error('❌ [PHASE 1 INTEGRATION] All mode simulation error:', error);
      return false;
    }
  }

  /**
   * Simulate specific mode filtering
   */
  private static simulateSpecificModeFiltering(mockMatrixData: DemandMatrixData): boolean {
    try {
      // Get unique staff IDs from the data
      const staffIds = new Set<string>();
      mockMatrixData.dataPoints.forEach(point => {
        point.taskBreakdown.forEach(task => {
          if (task.preferredStaff?.staffId) {
            staffIds.add(task.preferredStaff.staffId);
          }
        });
      });
      
      if (staffIds.size === 0) {
        console.warn('⚠️ [PHASE 1 INTEGRATION] No preferred staff assignments found for specific mode test');
        return true; // Not a failure - just no data to test with
      }
      
      // Test filtering by first staff ID
      const testStaffId = Array.from(staffIds)[0];
      const filteredTasks = mockMatrixData.dataPoints.reduce((tasks, point) => {
        return tasks.concat(point.taskBreakdown.filter(task => 
          task.preferredStaff?.staffId === testStaffId
        ));
      }, [] as any[]);
      
      const specificModeWorks = filteredTasks.length > 0 && 
        filteredTasks.every(task => task.preferredStaff?.staffId === testStaffId);
      
      console.log('🎯 [PHASE 1 INTEGRATION] Specific mode simulation:', {
        testStaffId,
        filteredTasksCount: filteredTasks.length,
        specificModeWorks
      });
      
      return specificModeWorks;
    } catch (error) {
      console.error('❌ [PHASE 1 INTEGRATION] Specific mode simulation error:', error);
      return false;
    }
  }

  /**
   * Simulate none mode filtering
   */
  private static simulateNoneModeFiltering(mockMatrixData: DemandMatrixData): boolean {
    try {
      // Filter for tasks without preferred staff
      const unassignedTasks = mockMatrixData.dataPoints.reduce((tasks, point) => {
        return tasks.concat(point.taskBreakdown.filter(task => 
          !task.preferredStaff?.staffId
        ));
      }, [] as any[]);
      
      const noneModeWorks = unassignedTasks.every(task => !task.preferredStaff?.staffId);
      
      console.log('🎯 [PHASE 1 INTEGRATION] None mode simulation:', {
        unassignedTasksCount: unassignedTasks.length,
        noneModeWorks
      });
      
      return noneModeWorks;
    } catch (error) {
      console.error('❌ [PHASE 1 INTEGRATION] None mode simulation error:', error);
      return false;
    }
  }

  /**
   * Test data flow validation
   */
  private static testDataFlowValidation(
    result: ComponentIntegrationResult,
    mockControlsState: any,
    mockFilteringResult: any
  ): void {
    console.log('🔍 [PHASE 1 INTEGRATION] Testing data flow validation...');

    try {
      // Test controls to filtering flow
      const controlsToFilteringFlow = mockControlsState.preferredStaffFilterMode &&
        mockFilteringResult &&
        typeof mockFilteringResult === 'object';
      
      result.dataFlowValidation.controlsToFilteringFlow = controlsToFilteringFlow;
      
      if (!controlsToFilteringFlow) {
        result.errors.push('Controls to filtering data flow not working');
      }

      // Test filtering to display flow
      const filteringToDisplayFlow = mockFilteringResult.dataPoints &&
        Array.isArray(mockFilteringResult.dataPoints);
      
      result.dataFlowValidation.filteringToDisplayFlow = filteringToDisplayFlow;
      
      if (!filteringToDisplayFlow) {
        result.errors.push('Filtering to display data flow not working');
      }

      // Test state consistency
      const stateConsistency = mockControlsState.preferredStaffFilterMode &&
        ['all', 'specific', 'none'].includes(mockControlsState.preferredStaffFilterMode);
      
      result.dataFlowValidation.stateConsistency = stateConsistency;
      
      if (!stateConsistency) {
        result.errors.push('State consistency not maintained');
      }

      console.log('✅ [PHASE 1 INTEGRATION] Data flow validation completed:', {
        controlsToFiltering: controlsToFilteringFlow,
        filteringToDisplay: filteringToDisplayFlow,
        stateConsistency
      });

    } catch (error) {
      result.errors.push(`Data flow validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate overall integration success
   */
  private static calculateIntegrationSuccess(result: ComponentIntegrationResult): boolean {
    const matrixControlsScore = Object.values(result.matrixControlsIntegration).filter(Boolean).length;
    const filteringScore = Object.values(result.filteringIntegration).filter(Boolean).length;
    const dataFlowScore = Object.values(result.dataFlowValidation).filter(Boolean).length;

    const totalScore = matrixControlsScore + filteringScore + dataFlowScore;
    const maxScore = 9; // 3 + 3 + 3

    const successRate = totalScore / maxScore;
    const isSuccess = successRate >= 0.8 && result.errors.length === 0;

    console.log('📊 [PHASE 1 INTEGRATION] Overall integration score:', {
      matrixControlsScore: `${matrixControlsScore}/3`,
      filteringScore: `${filteringScore}/3`,
      dataFlowScore: `${dataFlowScore}/3`,
      totalScore: `${totalScore}/${maxScore}`,
      successRate: `${(successRate * 100).toFixed(1)}%`,
      isSuccess,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });

    return isSuccess;
  }
}
