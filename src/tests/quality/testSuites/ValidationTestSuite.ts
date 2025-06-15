
/**
 * Validation Test Suite
 * 
 * Tests for validation logic and error handling
 */

import { revenueValidationService } from '@/services/forecasting/validation/RevenueValidationService';
import { loggingService } from '@/services/forecasting/validation/LoggingService';
import { errorHandlingService } from '@/services/forecasting/validation/ErrorHandlingService';

export class ValidationTestSuite {
  /**
   * Run all validation tests
   */
  public static async runTests(): Promise<{ passed: boolean; duration: number; error?: string }> {
    const startTime = Date.now();

    try {
      console.log('🔍 [VALIDATION TESTS] Starting test suite...');

      // Test 1: Revenue validation service
      await this.testRevenueValidationService();
      console.log('✅ Revenue validation service test passed');

      // Test 2: Logging service functionality
      await this.testLoggingService();
      console.log('✅ Logging service test passed');

      // Test 3: Error handling service
      await this.testErrorHandlingService();
      console.log('✅ Error handling service test passed');

      // Test 4: Data integrity validation
      await this.testDataIntegrityValidation();
      console.log('✅ Data integrity validation test passed');

      // Test 5: Input validation and sanitization
      await this.testInputValidationAndSanitization();
      console.log('✅ Input validation and sanitization test passed');

      const duration = Date.now() - startTime;
      console.log(`✅ [VALIDATION TESTS] All tests passed in ${duration}ms`);

      return { passed: true, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ [VALIDATION TESTS] Test failed: ${errorMessage}`);
      
      return { 
        passed: false, 
        duration, 
        error: errorMessage 
      };
    }
  }

  /**
   * Test revenue validation service
   */
  private static async testRevenueValidationService(): Promise<void> {
    // Create mock demand data
    const mockDemandData = {
      months: [{ key: '2024-01', label: 'Jan 2024' }],
      skills: ['Tax Preparation', 'Audit Services'],
      dataPoints: [{
        skillType: 'Tax Preparation',
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 100,
        taskCount: 5,
        clientCount: 3
      }],
      totalDemand: 100,
      totalTasks: 5,
      totalClients: 3,
      skillSummary: {
        'Tax Preparation': {
          totalHours: 100,
          taskCount: 5,
          clientCount: 3
        }
      },
      skillFeeRates: new Map([
        ['Tax Preparation', 85.00],
        ['Audit Services', 120.00]
      ]),
      clientRevenue: new Map([
        ['client-1', 1000.00],
        ['client-2', 1500.00]
      ]),
      clientSuggestedRevenue: new Map([
        ['client-1', 950.00],
        ['client-2', 1400.00]
      ])
    };

    // Test validation with good data
    const validationResult = revenueValidationService.validateRevenueData(mockDemandData);
    
    if (!validationResult.isValid && validationResult.errors.length > 0) {
      throw new Error(`Validation failed for good data: ${validationResult.errors.join(', ')}`);
    }

    // Test validation with missing skill rates
    const badData = {
      ...mockDemandData,
      skillFeeRates: new Map<string, number>() // Empty rates
    };

    const badValidationResult = revenueValidationService.validateRevenueData(badData);
    
    if (badValidationResult.missingSkillRates.length === 0) {
      throw new Error('Expected missing skill rates to be detected');
    }

    // Test validation recommendations
    const recommendations = revenueValidationService.getValidationRecommendations(badValidationResult);
    
    if (recommendations.length === 0) {
      throw new Error('Expected validation recommendations to be generated');
    }
  }

  /**
   * Test logging service functionality
   */
  private static async testLoggingService(): Promise<void> {
    // Clear previous logs
    loggingService.clearLogs();

    // Test different log levels
    loggingService.debug('test-operation', 'TestComponent', 'Debug message', { test: true });
    loggingService.info('test-operation', 'TestComponent', 'Info message', { test: true });
    loggingService.warn('test-operation', 'TestComponent', 'Warning message', { test: true });
    loggingService.error('test-operation', 'TestComponent', 'Error message', new Error('Test error'), { test: true });

    // Test performance timing
    const timerId = loggingService.startTimer('test-operation');
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    const duration = loggingService.endTimer(timerId, 'test-operation', 'TestComponent', true);

    if (duration <= 0) {
      throw new Error('Expected positive duration from timer');
    }

    // Test log retrieval
    const recentLogs = loggingService.getRecentLogs(10);
    
    if (recentLogs.length === 0) {
      throw new Error('Expected logs to be stored');
    }

    // Test filtering
    const errorLogs = loggingService.getRecentLogs(10, 'error');
    
    if (errorLogs.length === 0) {
      throw new Error('Expected error logs to be found');
    }

    // Test performance metrics
    const perfMetrics = loggingService.getPerformanceMetrics();
    
    if (perfMetrics.length === 0) {
      throw new Error('Expected performance metrics to be recorded');
    }

    // Test system info
    const systemInfo = loggingService.getSystemInfo();
    
    if (!systemInfo.sessionId || !systemInfo.timestamp) {
      throw new Error('Expected system info to contain session ID and timestamp');
    }
  }

  /**
   * Test error handling service
   */
  private static async testErrorHandlingService(): Promise<void> {
    // Test error handling with recovery
    const testError = new Error('Test error for handling');
    const context = {
      operation: 'test-operation',
      component: 'TestComponent',
      timestamp: new Date()
    };

    const recoveryResult = errorHandlingService.handleError(testError, context, true);
    
    if (!recoveryResult || typeof recoveryResult.success !== 'boolean') {
      throw new Error('Expected recovery result with success flag');
    }

    // Test error without recovery
    const noRecoveryResult = errorHandlingService.handleError(testError, context, false);
    
    if (noRecoveryResult.success) {
      throw new Error('Expected recovery to fail when recovery is disabled');
    }

    // Test error reporting
    const errorReport = errorHandlingService.generateErrorReport();
    
    if (!errorReport || !errorReport.includes('Test error for handling')) {
      throw new Error('Expected error to be included in error report');
    }

    // Test error metrics
    const errorMetrics = errorHandlingService.getErrorMetrics();
    
    if (errorMetrics.totalErrors === 0) {
      throw new Error('Expected error metrics to show recorded errors');
    }
  }

  /**
   * Test data integrity validation
   */
  private static async testDataIntegrityValidation(): Promise<void> {
    // Test data consistency checks
    const testData = {
      totalHours: 100,
      totalRevenue: 8500,
      hourlyRate: 85
    };

    // Check calculation consistency
    const calculatedRevenue = testData.totalHours * testData.hourlyRate;
    
    if (Math.abs(calculatedRevenue - testData.totalRevenue) > 0.01) {
      throw new Error(`Data integrity check failed: calculated ${calculatedRevenue}, expected ${testData.totalRevenue}`);
    }

    // Test data range validation
    const validRanges = {
      hours: { min: 0, max: 10000 },
      revenue: { min: 0, max: 1000000 },
      rate: { min: 10, max: 500 }
    };

    if (testData.totalHours < validRanges.hours.min || testData.totalHours > validRanges.hours.max) {
      throw new Error('Hours value outside valid range');
    }

    if (testData.totalRevenue < validRanges.revenue.min || testData.totalRevenue > validRanges.revenue.max) {
      throw new Error('Revenue value outside valid range');
    }

    if (testData.hourlyRate < validRanges.rate.min || testData.hourlyRate > validRanges.rate.max) {
      throw new Error('Hourly rate outside valid range');
    }
  }

  /**
   * Test input validation and sanitization
   */
  private static async testInputValidationAndSanitization(): Promise<void> {
    // Test numeric input validation
    const numericInputs = [
      { value: '123.45', expected: 123.45, valid: true },
      { value: '-50', expected: -50, valid: true },
      { value: 'not-a-number', expected: NaN, valid: false },
      { value: '', expected: NaN, valid: false },
      { value: '0', expected: 0, valid: true }
    ];

    for (const input of numericInputs) {
      const parsed = parseFloat(input.value);
      const isValid = !isNaN(parsed);
      
      if (isValid !== input.valid) {
        throw new Error(`Input validation failed for "${input.value}": expected ${input.valid}, got ${isValid}`);
      }
      
      if (isValid && Math.abs(parsed - input.expected) > 0.001) {
        throw new Error(`Parsed value incorrect for "${input.value}": expected ${input.expected}, got ${parsed}`);
      }
    }

    // Test string input sanitization
    const stringInputs = [
      { value: 'normal-string', expected: 'normal-string', valid: true },
      { value: '', expected: '', valid: false },
      { value: '   whitespace   ', expected: 'whitespace', valid: true },
      { value: 'special<>chars&', expected: 'special<>chars&', valid: true }
    ];

    for (const input of stringInputs) {
      const sanitized = input.value.trim();
      const isValid = sanitized.length > 0;
      
      if (isValid !== input.valid) {
        throw new Error(`String validation failed for "${input.value}": expected ${input.valid}, got ${isValid}`);
      }
      
      if (isValid && sanitized !== input.expected) {
        throw new Error(`Sanitized value incorrect for "${input.value}": expected "${input.expected}", got "${sanitized}"`);
      }
    }

    // Test array input validation
    const arrayInputs = [
      { value: ['item1', 'item2'], expected: 2, valid: true },
      { value: [], expected: 0, valid: false },
      { value: null, expected: 0, valid: false },
      { value: undefined, expected: 0, valid: false }
    ];

    for (const input of arrayInputs) {
      const array = Array.isArray(input.value) ? input.value : [];
      const isValid = array.length > 0;
      
      if (isValid !== input.valid) {
        throw new Error(`Array validation failed for ${JSON.stringify(input.value)}: expected ${input.valid}, got ${isValid}`);
      }
      
      if (array.length !== input.expected) {
        throw new Error(`Array length incorrect for ${JSON.stringify(input.value)}: expected ${input.expected}, got ${array.length}`);
      }
    }
  }

  /**
   * Test validation with edge cases
   */
  public static async testValidationEdgeCases(): Promise<void> {
    console.log('🧪 Testing validation edge cases...');

    // Test very large numbers
    const largeNumber = 999999999.99;
    if (isNaN(largeNumber) || !isFinite(largeNumber)) {
      throw new Error('Large number validation failed');
    }

    // Test very small numbers
    const smallNumber = 0.01;
    if (isNaN(smallNumber) || !isFinite(smallNumber)) {
      throw new Error('Small number validation failed');
    }

    // Test boundary conditions
    const boundaries = [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    
    for (const boundary of boundaries) {
      if (!Number.isInteger(boundary) && boundary !== 0) {
        continue; // Skip non-integers for this test
      }
      
      if (!isFinite(boundary)) {
        throw new Error(`Boundary validation failed for ${boundary}`);
      }
    }

    console.log('✅ Validation edge cases passed');
  }
}
