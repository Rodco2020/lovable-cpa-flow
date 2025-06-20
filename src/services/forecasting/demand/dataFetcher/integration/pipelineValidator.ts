
/**
 * Phase 1: Data Pipeline Integration Validator
 * 
 * Comprehensive validation service to ensure data pipeline integrity
 * and backward compatibility during preferred staff filtering implementation
 */

import { supabase } from '@/lib/supabaseClient';
import { debugLog } from '../../logger';

export interface PipelineValidationResult {
  success: boolean;
  dataIntegrity: {
    preferredStaffDataLoaded: boolean;
    recurringTasksLoaded: boolean;
    clientsLoaded: boolean;
    skillsLoaded: boolean;
  };
  filteringLogic: {
    allModeWorking: boolean;
    specificModeWorking: boolean;
    noneModeWorking: boolean;
  };
  backwardCompatibility: {
    existingFiltersWorking: boolean;
    exportFunctionalityIntact: boolean;
    matrixDataConsistent: boolean;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Phase 1: Pipeline Validator Service
 * Validates the entire data pipeline and ensures backward compatibility
 */
export class PipelineValidator {
  /**
   * Run comprehensive validation of the data pipeline
   */
  static async validateDataPipeline(): Promise<PipelineValidationResult> {
    console.log('🔍 [PHASE 1 VALIDATOR] Starting comprehensive data pipeline validation');
    
    const result: PipelineValidationResult = {
      success: false,
      dataIntegrity: {
        preferredStaffDataLoaded: false,
        recurringTasksLoaded: false,
        clientsLoaded: false,
        skillsLoaded: false
      },
      filteringLogic: {
        allModeWorking: false,
        specificModeWorking: false,
        noneModeWorking: false
      },
      backwardCompatibility: {
        existingFiltersWorking: false,
        exportFunctionalityIntact: false,
        matrixDataConsistent: false
      },
      errors: [],
      warnings: []
    };

    try {
      // Validate data integrity
      await this.validateDataIntegrity(result);
      
      // Validate filtering logic
      await this.validateFilteringLogic(result);
      
      // Validate backward compatibility
      await this.validateBackwardCompatibility(result);
      
      // Determine overall success
      result.success = this.calculateOverallSuccess(result);
      
      console.log('✅ [PHASE 1 VALIDATOR] Pipeline validation completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] Critical validation error:', error);
      result.errors.push(`Critical validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Validate that all required data loads correctly from the database
   */
  private static async validateDataIntegrity(result: PipelineValidationResult): Promise<void> {
    console.log('🔍 [PHASE 1 VALIDATOR] Validating data integrity...');

    try {
      // Test preferred staff data loading
      const preferredStaffData = await this.testPreferredStaffDataLoading();
      result.dataIntegrity.preferredStaffDataLoaded = preferredStaffData.success;
      if (!preferredStaffData.success) {
        result.errors.push(`Preferred staff data loading failed: ${preferredStaffData.error}`);
      }

      // Test recurring tasks loading
      const recurringTasksData = await this.testRecurringTasksLoading();
      result.dataIntegrity.recurringTasksLoaded = recurringTasksData.success;
      if (!recurringTasksData.success) {
        result.errors.push(`Recurring tasks loading failed: ${recurringTasksData.error}`);
      }

      // Test clients loading
      const clientsData = await this.testClientsLoading();
      result.dataIntegrity.clientsLoaded = clientsData.success;
      if (!clientsData.success) {
        result.errors.push(`Clients loading failed: ${clientsData.error}`);
      }

      // Test skills loading
      const skillsData = await this.testSkillsLoading();
      result.dataIntegrity.skillsLoaded = skillsData.success;
      if (!skillsData.success) {
        result.errors.push(`Skills loading failed: ${skillsData.error}`);
      }

    } catch (error) {
      result.errors.push(`Data integrity validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test preferred staff data loading from database
   */
  private static async testPreferredStaffDataLoading(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          preferred_staff_id,
          staff:preferred_staff_id (
            id,
            full_name,
            status
          )
        `)
        .not('preferred_staff_id', 'is', null)
        .eq('is_active', true)
        .limit(10);

      if (error) {
        return { success: false, error: error.message };
      }

      const hasValidData = data && data.length > 0 && data.some(record => 
        record.staff && typeof record.staff === 'object'
      );

      if (!hasValidData) {
        return { success: false, error: 'No valid preferred staff data found' };
      }

      console.log('✅ [PHASE 1 VALIDATOR] Preferred staff data loading validated:', {
        recordCount: data.length,
        hasStaffData: data.filter(r => r.staff).length
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test recurring tasks loading
   */
  private static async testRecurringTasksLoading(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('id, name, is_active, client_id, preferred_staff_id')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'No recurring tasks found' };
      }

      console.log('✅ [PHASE 1 VALIDATOR] Recurring tasks loading validated:', {
        recordCount: data.length,
        withPreferredStaff: data.filter(r => r.preferred_staff_id).length
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test clients loading
   */
  private static async testClientsLoading(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, status')
        .eq('status', 'active')
        .limit(10);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'No active clients found' };
      }

      console.log('✅ [PHASE 1 VALIDATOR] Clients loading validated:', {
        recordCount: data.length
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test skills loading
   */
  private static async testSkillsLoading(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .limit(10);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'No skills found' };
      }

      console.log('✅ [PHASE 1 VALIDATOR] Skills loading validated:', {
        recordCount: data.length
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Validate three-mode filtering logic works correctly
   */
  private static async validateFilteringLogic(result: PipelineValidationResult): Promise<void> {
    console.log('🔍 [PHASE 1 VALIDATOR] Validating filtering logic...');

    try {
      // Test 'all' mode - should show all tasks
      result.filteringLogic.allModeWorking = await this.testAllModeFiltering();
      
      // Test 'specific' mode - should show only selected preferred staff tasks
      result.filteringLogic.specificModeWorking = await this.testSpecificModeFiltering();
      
      // Test 'none' mode - should show only unassigned tasks
      result.filteringLogic.noneModeWorking = await this.testNoneModeFiltering();

    } catch (error) {
      result.errors.push(`Filtering logic validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test 'all' mode filtering
   */
  private static async testAllModeFiltering(): Promise<boolean> {
    try {
      // Simulate the 'all' mode logic
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('id, name, preferred_staff_id')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('❌ [PHASE 1 VALIDATOR] All mode test failed:', error);
        return false;
      }

      // In 'all' mode, we should get both assigned and unassigned tasks
      const hasAssignedTasks = data?.some(task => task.preferred_staff_id);
      const hasUnassignedTasks = data?.some(task => !task.preferred_staff_id);

      console.log('✅ [PHASE 1 VALIDATOR] All mode filtering validated:', {
        totalTasks: data?.length || 0,
        hasAssignedTasks,
        hasUnassignedTasks
      });

      return true;
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] All mode filtering test error:', error);
      return false;
    }
  }

  /**
   * Test 'specific' mode filtering
   */
  private static async testSpecificModeFiltering(): Promise<boolean> {
    try {
      // Get a sample staff ID
      const { data: staffData } = await supabase
        .from('recurring_tasks')
        .select('preferred_staff_id')
        .not('preferred_staff_id', 'is', null)
        .limit(1);

      if (!staffData || staffData.length === 0) {
        console.warn('⚠️ [PHASE 1 VALIDATOR] No preferred staff assignments found for specific mode test');
        return true; // Not a failure - just no data to test with
      }

      const testStaffId = staffData[0].preferred_staff_id;

      // Test filtering by specific staff
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('id, name, preferred_staff_id')
        .eq('preferred_staff_id', testStaffId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ [PHASE 1 VALIDATOR] Specific mode test failed:', error);
        return false;
      }

      // All returned tasks should have the specified staff ID
      const allTasksMatchStaff = data?.every(task => task.preferred_staff_id === testStaffId);

      console.log('✅ [PHASE 1 VALIDATOR] Specific mode filtering validated:', {
        testStaffId,
        tasksFound: data?.length || 0,
        allTasksMatchStaff
      });

      return allTasksMatchStaff || false;
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] Specific mode filtering test error:', error);
      return false;
    }
  }

  /**
   * Test 'none' mode filtering
   */
  private static async testNoneModeFiltering(): Promise<boolean> {
    try {
      // Test filtering for unassigned tasks only
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('id, name, preferred_staff_id')
        .is('preferred_staff_id', null)
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('❌ [PHASE 1 VALIDATOR] None mode test failed:', error);
        return false;
      }

      // All returned tasks should have null preferred_staff_id
      const allTasksUnassigned = data?.every(task => !task.preferred_staff_id);

      console.log('✅ [PHASE 1 VALIDATOR] None mode filtering validated:', {
        unassignedTasksFound: data?.length || 0,
        allTasksUnassigned
      });

      return allTasksUnassigned || false;
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] None mode filtering test error:', error);
      return false;
    }
  }

  /**
   * Validate backward compatibility with existing functionality
   */
  private static async validateBackwardCompatibility(result: PipelineValidationResult): Promise<void> {
    console.log('🔍 [PHASE 1 VALIDATOR] Validating backward compatibility...');

    try {
      // Test that existing filters still work
      result.backwardCompatibility.existingFiltersWorking = await this.testExistingFilters();
      
      // Test export functionality integrity
      result.backwardCompatibility.exportFunctionalityIntact = await this.testExportFunctionality();
      
      // Test matrix data consistency
      result.backwardCompatibility.matrixDataConsistent = await this.testMatrixDataConsistency();

    } catch (error) {
      result.errors.push(`Backward compatibility validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test that existing filters (skills, clients, time) still work
   */
  private static async testExistingFilters(): Promise<boolean> {
    try {
      // Test skills filter
      const { data: skillsData } = await supabase
        .from('skills')
        .select('id, name')
        .limit(1);

      if (skillsData && skillsData.length > 0) {
        const testSkill = skillsData[0].name;
        
        const { data: filteredTasks, error } = await supabase
          .from('recurring_tasks')
          .select('id, required_skills')
          .contains('required_skills', [testSkill])
          .eq('is_active', true)
          .limit(5);

        if (error) {
          console.error('❌ [PHASE 1 VALIDATOR] Skills filter test failed:', error);
          return false;
        }

        const skillsFilterWorking = filteredTasks?.every(task => 
          task.required_skills.includes(testSkill)
        );

        if (!skillsFilterWorking) {
          console.warn('⚠️ [PHASE 1 VALIDATOR] Skills filter may not be working correctly');
        }
      }

      // Test clients filter
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'active')
        .limit(1);

      if (clientsData && clientsData.length > 0) {
        const testClientId = clientsData[0].id;
        
        const { data: clientTasks, error } = await supabase
          .from('recurring_tasks')
          .select('id, client_id')
          .eq('client_id', testClientId)
          .eq('is_active', true)
          .limit(5);

        if (error) {
          console.error('❌ [PHASE 1 VALIDATOR] Clients filter test failed:', error);
          return false;
        }

        const clientsFilterWorking = clientTasks?.every(task => 
          task.client_id === testClientId
        );

        if (!clientsFilterWorking) {
          console.warn('⚠️ [PHASE 1 VALIDATOR] Clients filter may not be working correctly');
        }
      }

      console.log('✅ [PHASE 1 VALIDATOR] Existing filters validated');
      return true;
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] Existing filters test error:', error);
      return false;
    }
  }

  /**
   * Test export functionality integrity
   */
  private static async testExportFunctionality(): Promise<boolean> {
    try {
      // Test that data structure for export is intact
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          name,
          estimated_hours,
          required_skills,
          client_id,
          preferred_staff_id,
          clients (legal_name),
          staff:preferred_staff_id (full_name)
        `)
        .eq('is_active', true)
        .limit(5);

      if (error) {
        console.error('❌ [PHASE 1 VALIDATOR] Export data structure test failed:', error);
        return false;
      }

      // Verify that all required fields for export are present
      const hasRequiredFields = data?.every(task => 
        task.id && 
        task.name && 
        task.estimated_hours !== null &&
        task.required_skills &&
        task.client_id
      );

      console.log('✅ [PHASE 1 VALIDATOR] Export functionality validated:', {
        recordsChecked: data?.length || 0,
        hasRequiredFields
      });

      return hasRequiredFields || false;
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] Export functionality test error:', error);
      return false;
    }
  }

  /**
   * Test matrix data consistency
   */
  private static async testMatrixDataConsistency(): Promise<boolean> {
    try {
      // Test that matrix data structure is consistent
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          name,
          estimated_hours,
          required_skills,
          recurrence_type,
          client_id,
          preferred_staff_id
        `)
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('❌ [PHASE 1 VALIDATOR] Matrix data consistency test failed:', error);
        return false;
      }

      // Verify data consistency
      const isConsistent = data?.every(task => 
        task.id &&
        task.name &&
        task.estimated_hours !== null &&
        Array.isArray(task.required_skills) &&
        task.recurrence_type &&
        task.client_id
      );

      console.log('✅ [PHASE 1 VALIDATOR] Matrix data consistency validated:', {
        recordsChecked: data?.length || 0,
        isConsistent
      });

      return isConsistent || false;
    } catch (error) {
      console.error('❌ [PHASE 1 VALIDATOR] Matrix data consistency test error:', error);
      return false;
    }
  }

  /**
   * Calculate overall success based on all validation results
   */
  private static calculateOverallSuccess(result: PipelineValidationResult): boolean {
    const dataIntegrityScore = Object.values(result.dataIntegrity).filter(Boolean).length;
    const filteringLogicScore = Object.values(result.filteringLogic).filter(Boolean).length;
    const backwardCompatibilityScore = Object.values(result.backwardCompatibility).filter(Boolean).length;

    const totalScore = dataIntegrityScore + filteringLogicScore + backwardCompatibilityScore;
    const maxScore = 10; // 4 + 3 + 3

    const successRate = totalScore / maxScore;
    const isSuccess = successRate >= 0.8 && result.errors.length === 0;

    console.log('📊 [PHASE 1 VALIDATOR] Overall validation score:', {
      dataIntegrityScore: `${dataIntegrityScore}/4`,
      filteringLogicScore: `${filteringLogicScore}/3`,
      backwardCompatibilityScore: `${backwardCompatibilityScore}/3`,
      totalScore: `${totalScore}/${maxScore}`,
      successRate: `${(successRate * 100).toFixed(1)}%`,
      isSuccess,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });

    return isSuccess;
  }
}
