
import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';

/**
 * Service Validation Service - Phase 2 Implementation
 * 
 * Provides comprehensive validation and testing capabilities for the service layer,
 * specifically focused on preferred staff persistence validation.
 */

export class ServiceValidationError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(`ServiceValidation: ${message}`);
    this.name = 'ServiceValidationError';
  }
}

export interface ValidationResult {
  success: boolean;
  field: string;
  operation: string;
  expected: any;
  actual: any;
  message: string;
  timestamp: string;
  details?: any;
}

export interface ServiceValidationReport {
  testId: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  summary: string;
}

/**
 * Staff ID Validation Service
 */
export const validateStaffExists = async (staffId: string | null): Promise<boolean> => {
  if (!staffId) return true; // null/undefined is valid (removes preferred staff)
  
  try {
    console.log(`[ServiceValidation] Validating staff existence: ${staffId}`);
    
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, status')
      .eq('id', staffId)
      .eq('status', 'active')
      .single();
      
    if (error) {
      console.log(`[ServiceValidation] Staff validation error:`, error);
      return false;
    }
    
    const exists = !!data;
    console.log(`[ServiceValidation] Staff ${staffId} exists: ${exists}`, data);
    return exists;
  } catch (error) {
    console.error(`[ServiceValidation] Error validating staff:`, error);
    return false;
  }
};

/**
 * Enhanced Data Transformation Validator
 */
export const validateDataTransformation = (
  input: Partial<RecurringTask>,
  transformedOutput: any
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const timestamp = new Date().toISOString();
  
  console.log(`[ServiceValidation] ================= TRANSFORMATION VALIDATION =================`);
  console.log(`[ServiceValidation] Input:`, JSON.stringify(input, null, 2));
  console.log(`[ServiceValidation] Transformed Output:`, JSON.stringify(transformedOutput, null, 2));
  
  // Test 1: PreferredStaffId transformation
  if ('preferredStaffId' in input) {
    const expected = input.preferredStaffId;
    const actual = transformedOutput.preferred_staff_id;
    const success = expected === actual;
    
    results.push({
      success,
      field: 'preferredStaffId',
      operation: 'transform_to_database',
      expected,
      actual,
      message: success 
        ? 'PreferredStaffId correctly transformed to preferred_staff_id'
        : `Transformation failed: expected ${expected}, got ${actual}`,
      timestamp,
      details: {
        inputType: typeof expected,
        outputType: typeof actual,
        inputValue: expected,
        outputValue: actual
      }
    });
    
    console.log(`[ServiceValidation] PreferredStaffId transformation: ${success ? 'PASS' : 'FAIL'}`);
    console.log(`[ServiceValidation] Expected: ${expected}, Actual: ${actual}`);
  }
  
  // Test 2: Field preservation (other fields should remain intact)
  const criticalFields = ['name', 'estimatedHours', 'priority', 'category'];
  criticalFields.forEach(field => {
    if (field in input) {
      const dbField = field === 'estimatedHours' ? 'estimated_hours' : field;
      const expected = input[field as keyof RecurringTask];
      const actual = transformedOutput[dbField];
      const success = expected === actual;
      
      results.push({
        success,
        field,
        operation: 'field_preservation',
        expected,
        actual,
        message: success 
          ? `Field ${field} correctly preserved`
          : `Field ${field} transformation failed`,
        timestamp
      });
    }
  });
  
  console.log(`[ServiceValidation] ================= TRANSFORMATION VALIDATION END =================`);
  return results;
};

/**
 * Post-Update Database Verification
 */
export const verifyDatabasePersistence = async (
  taskId: string,
  expectedValues: Partial<RecurringTask>
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];
  const timestamp = new Date().toISOString();
  
  console.log(`[ServiceValidation] ================= DATABASE PERSISTENCE VERIFICATION =================`);
  console.log(`[ServiceValidation] Task ID: ${taskId}`);
  console.log(`[ServiceValidation] Expected values:`, JSON.stringify(expectedValues, null, 2));
  
  try {
    // Fetch current database state
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      results.push({
        success: false,
        field: 'database_query',
        operation: 'fetch_verification',
        expected: 'successful_query',
        actual: error.message,
        message: `Database query failed: ${error.message}`,
        timestamp,
        details: error
      });
      return results;
    }
    
    console.log(`[ServiceValidation] Current database state:`, JSON.stringify(data, null, 2));
    
    // Verify preferred_staff_id specifically
    if ('preferredStaffId' in expectedValues) {
      const expected = expectedValues.preferredStaffId;
      const actual = data.preferred_staff_id;
      const success = expected === actual;
      
      results.push({
        success,
        field: 'preferred_staff_id',
        operation: 'database_persistence',
        expected,
        actual,
        message: success 
          ? 'Preferred staff ID correctly persisted in database'
          : `Database persistence failed: expected ${expected}, found ${actual}`,
        timestamp,
        details: {
          taskId,
          databaseRow: data,
          updatedAt: data.updated_at
        }
      });
      
      console.log(`[ServiceValidation] Database persistence check: ${success ? 'PASS' : 'FAIL'}`);
      console.log(`[ServiceValidation] Expected: ${expected}, Found: ${actual}`);
    }
    
    // Verify other critical fields
    const verifyFields = {
      name: 'name',
      estimatedHours: 'estimated_hours',
      priority: 'priority',
      category: 'category'
    };
    
    Object.entries(verifyFields).forEach(([appField, dbField]) => {
      if (appField in expectedValues) {
        const expected = expectedValues[appField as keyof RecurringTask];
        const actual = data[dbField];
        const success = expected === actual;
        
        results.push({
          success,
          field: appField,
          operation: 'database_persistence',
          expected,
          actual,
          message: success 
            ? `Field ${appField} correctly persisted`
            : `Field ${appField} persistence failed`,
          timestamp
        });
      }
    });
    
  } catch (error) {
    results.push({
      success: false,
      field: 'verification_process',
      operation: 'database_verification',
      expected: 'successful_verification',
      actual: error,
      message: `Database verification failed: ${error}`,
      timestamp,
      details: error
    });
  }
  
  console.log(`[ServiceValidation] ================= DATABASE PERSISTENCE VERIFICATION END =================`);
  return results;
};

/**
 * Comprehensive Service Method Test
 */
export const testServiceMethod = async (
  taskId: string,
  updates: Partial<RecurringTask>
): Promise<ServiceValidationReport> => {
  const testId = `service_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  const allResults: ValidationResult[] = [];
  
  console.log(`[ServiceValidation] ================= SERVICE METHOD COMPREHENSIVE TEST =================`);
  console.log(`[ServiceValidation] Test ID: ${testId}`);
  console.log(`[ServiceValidation] Task ID: ${taskId}`);
  console.log(`[ServiceValidation] Updates:`, JSON.stringify(updates, null, 2));
  
  try {
    // Step 1: Pre-validation
    if (updates.preferredStaffId) {
      const staffExists = await validateStaffExists(updates.preferredStaffId);
      allResults.push({
        success: staffExists,
        field: 'preferredStaffId',
        operation: 'pre_validation',
        expected: 'valid_staff_id',
        actual: staffExists ? 'valid' : 'invalid',
        message: staffExists 
          ? 'Staff ID pre-validation passed'
          : 'Staff ID does not exist or is inactive',
        timestamp
      });
      
      if (!staffExists) {
        console.log(`[ServiceValidation] ❌ Pre-validation failed: Staff ${updates.preferredStaffId} does not exist`);
      }
    }
    
    // Step 2: Import and test the actual service method
    const { updateRecurringTask } = await import('./recurringTaskService');
    const { transformApplicationToDatabase } = await import('./dataTransformationService');
    
    // Step 3: Test transformation
    const transformedData = transformApplicationToDatabase(updates);
    const transformationResults = validateDataTransformation(updates, transformedData);
    allResults.push(...transformationResults);
    
    // Step 4: Execute service method
    console.log(`[ServiceValidation] Executing updateRecurringTask service method...`);
    const serviceStartTime = performance.now();
    const updatedTask = await updateRecurringTask(taskId, updates);
    const serviceEndTime = performance.now();
    const serviceDuration = serviceEndTime - serviceStartTime;
    
    console.log(`[ServiceValidation] Service method completed in ${serviceDuration.toFixed(2)}ms`);
    
    if (updatedTask) {
      allResults.push({
        success: true,
        field: 'service_execution',
        operation: 'updateRecurringTask',
        expected: 'successful_update',
        actual: 'success',
        message: `Service method executed successfully in ${serviceDuration.toFixed(2)}ms`,
        timestamp,
        details: {
          duration: serviceDuration,
          updatedTask: updatedTask
        }
      });
      
      // Step 5: Post-update verification
      setTimeout(async () => {
        const verificationResults = await verifyDatabasePersistence(taskId, updates);
        allResults.push(...verificationResults);
        
        // Generate final report
        const passedTests = allResults.filter(r => r.success).length;
        const failedTests = allResults.filter(r => !r.success).length;
        
        console.log(`[ServiceValidation] ================= TEST SUMMARY =================`);
        console.log(`[ServiceValidation] Test ID: ${testId}`);
        console.log(`[ServiceValidation] Total Tests: ${allResults.length}`);
        console.log(`[ServiceValidation] Passed: ${passedTests}`);
        console.log(`[ServiceValidation] Failed: ${failedTests}`);
        console.log(`[ServiceValidation] Success Rate: ${((passedTests / allResults.length) * 100).toFixed(1)}%`);
        console.log(`[ServiceValidation] ================= TEST SUMMARY END =================`);
      }, 1000);
      
    } else {
      allResults.push({
        success: false,
        field: 'service_execution',
        operation: 'updateRecurringTask',
        expected: 'updated_task_object',
        actual: null,
        message: 'Service method returned null',
        timestamp
      });
    }
    
  } catch (error) {
    console.error(`[ServiceValidation] Service method test failed:`, error);
    allResults.push({
      success: false,
      field: 'service_execution',
      operation: 'updateRecurringTask',
      expected: 'successful_execution',
      actual: error,
      message: `Service method failed: ${error}`,
      timestamp,
      details: error
    });
  }
  
  // Generate report
  const passedTests = allResults.filter(r => r.success).length;
  const failedTests = allResults.filter(r => !r.success).length;
  const successRate = allResults.length > 0 ? (passedTests / allResults.length) * 100 : 0;
  
  const report: ServiceValidationReport = {
    testId,
    timestamp,
    totalTests: allResults.length,
    passedTests,
    failedTests,
    results: allResults,
    summary: `Service validation completed: ${passedTests}/${allResults.length} tests passed (${successRate.toFixed(1)}% success rate)`
  };
  
  console.log(`[ServiceValidation] ================= SERVICE METHOD TEST COMPLETE =================`);
  return report;
};

/**
 * Quick service method test for debugging
 */
export const quickServiceTest = async (
  taskId: string, 
  preferredStaffId: string | null
): Promise<boolean> => {
  try {
    console.log(`[ServiceValidation] Quick test: ${taskId} → ${preferredStaffId}`);
    
    const { updateRecurringTask } = await import('./recurringTaskService');
    const result = await updateRecurringTask(taskId, { preferredStaffId });
    
    if (result && result.preferredStaffId === preferredStaffId) {
      console.log(`[ServiceValidation] ✅ Quick test PASSED`);
      return true;
    } else {
      console.log(`[ServiceValidation] ❌ Quick test FAILED`);
      return false;
    }
  } catch (error) {
    console.error(`[ServiceValidation] Quick test ERROR:`, error);
    return false;
  }
};
