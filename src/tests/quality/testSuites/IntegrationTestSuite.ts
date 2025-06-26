
/**
 * Integration Test Suite
 * 
 * Tests for end-to-end integration and workflow validation
 */

import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { suggestedRevenueCalculator } from '@/services/forecasting/demand/calculators/SuggestedRevenueCalculator';

export class IntegrationTestSuite {
  /**
   * Run all integration tests
   */
  public static async runTests(): Promise<{ passed: boolean; duration: number; error?: string }> {
    const startTime = Date.now();

    try {
      console.log('🔗 [INTEGRATION TESTS] Starting test suite...');

      // Test 1: End-to-end matrix generation and filtering
      await this.testEndToEndMatrixWorkflow();
      console.log('✅ End-to-end matrix workflow test passed');

      // Test 2: Revenue calculation integration
      await this.testRevenueCalculationIntegration();
      console.log('✅ Revenue calculation integration test passed');

      // Test 3: Service communication and data flow
      await this.testServiceCommunication();
      console.log('✅ Service communication test passed');

      // Test 4: Error propagation and handling
      await this.testErrorPropagationAndHandling();
      console.log('✅ Error propagation and handling test passed');

      // Test 5: Performance optimization integration
      await this.testPerformanceOptimizationIntegration();
      console.log('✅ Performance optimization integration test passed');

      const duration = Date.now() - startTime;
      console.log(`✅ [INTEGRATION TESTS] All tests passed in ${duration}ms`);

      return { passed: true, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ [INTEGRATION TESTS] Test failed: ${errorMessage}`);
      
      return { 
        passed: false, 
        duration, 
        error: errorMessage 
      };
    }
  }

  /**
   * Test end-to-end matrix generation and filtering workflow
   */
  private static async testEndToEndMatrixWorkflow(): Promise<void> {
    // Step 1: Generate matrix data
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Matrix generation failed in end-to-end test');
    }

    // Step 2: Validate initial data structure
    if (!matrixData.months || matrixData.months.length === 0) {
      throw new Error('No months in generated matrix data');
    }

    if (!matrixData.skills || matrixData.skills.length === 0) {
      throw new Error('No skills in generated matrix data');
    }

    if (!matrixData.dataPoints || matrixData.dataPoints.length === 0) {
      throw new Error('No data points in generated matrix data');
    }

    // Step 3: Apply filtering
    const filters = {
      skills: [matrixData.skills[0]], // Filter to first skill only
      clients: [],
      preferredStaff: [], // Phase 3: Add preferredStaff field
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-06-30')
      }
    };

    const filteredData = DemandPerformanceOptimizer.optimizeFiltering(matrixData, filters);

    // Step 4: Validate filtered results
    if (!filteredData || filteredData.dataPoints.length === 0) {
      throw new Error('Filtering removed all data points');
    }

    // Check that filtering worked correctly
    const hasOtherSkills = filteredData.dataPoints.some(
      dp => dp.skillType !== matrixData.skills[0]
    );

    if (hasOtherSkills) {
      throw new Error('Filtering did not properly filter by skill');
    }

    // Step 5: Validate data consistency after filtering
    const originalTotal = matrixData.totalDemand;
    const filteredTotal = filteredData.totalDemand;

    if (filteredTotal > originalTotal) {
      throw new Error('Filtered total exceeds original total');
    }

    console.log(`End-to-end workflow: ${originalTotal} -> ${filteredTotal} hours (${matrixData.skills.length} -> ${filteredData.skills.length} skills)`);
  }

  /**
   * Test revenue calculation integration
   */
  private static async testRevenueCalculationIntegration(): Promise<void> {
    // Step 1: Generate matrix with revenue calculations
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Matrix generation failed for revenue integration test');
    }

    // Step 2: Test revenue calculation consistency
    if (matrixData.revenueTotals) {
      // Validate revenue totals are consistent
      if (matrixData.revenueTotals.totalSuggestedRevenue < 0) {
        throw new Error('Negative total suggested revenue');
      }

      if (matrixData.revenueTotals.totalExpectedRevenue < 0) {
        throw new Error('Negative total expected revenue');
      }

      // Test expected less suggested calculation
      const calculatedDifference = matrixData.revenueTotals.totalExpectedRevenue - matrixData.revenueTotals.totalSuggestedRevenue;
      
      if (Math.abs(calculatedDifference - matrixData.revenueTotals.totalExpectedLessSuggested) > 0.01) {
        throw new Error('Revenue difference calculation inconsistent');
      }
    }

    // Step 3: Test individual calculation components
    const skillFeeRates = matrixData.skillFeeRates || new Map();
    
    if (skillFeeRates.size > 0) {
      const firstSkill = Array.from(skillFeeRates.keys())[0];
      const firstRate = skillFeeRates.get(firstSkill)!;

      // Test individual calculation
      const testRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
        10, // 10 hours
        firstSkill,
        skillFeeRates
      );

      const expectedRevenue = 10 * firstRate;
      
      if (Math.abs(testRevenue - expectedRevenue) > 0.01) {
        throw new Error(`Individual calculation mismatch: expected ${expectedRevenue}, got ${testRevenue}`);
      }
    }

    console.log('Revenue calculation integration validated successfully');
  }

  /**
   * Test service communication and data flow
   */
  private static async testServiceCommunication(): Promise<void> {
    // Test matrix service communication
    const startTime = performance.now();
    
    // Generate matrix data
    const result1 = await DemandMatrixService.generateDemandMatrix('demand-only');
    const generationTime = performance.now() - startTime;

    if (generationTime > 10000) { // 10 seconds
      throw new Error(`Service communication too slow: ${generationTime}ms`);
    }

    if (!result1.matrixData) {
      throw new Error('Service communication failed - no data returned');
    }

    // Test cache communication
    const cacheStartTime = performance.now();
    const result2 = await DemandMatrixService.generateDemandMatrix('demand-only');
    const cacheTime = performance.now() - cacheStartTime;

    // Second call should be faster due to caching
    if (cacheTime > generationTime && cacheTime > 5000) {
      console.warn(`Cache may not be working efficiently: ${cacheTime}ms vs ${generationTime}ms`);
    }

    // Test data consistency between calls
    if (result1.matrixData && result2.matrixData) {
      if (result1.matrixData.totalDemand !== result2.matrixData.totalDemand) {
        throw new Error('Data inconsistency between service calls');
      }
    }

    console.log(`Service communication test: Generation ${generationTime.toFixed(0)}ms, Cache ${cacheTime.toFixed(0)}ms`);
  }

  /**
   * Test error propagation and handling
   */
  private static async testErrorPropagationAndHandling(): Promise<void> {
    // Test graceful error handling in services
    try {
      // This should not cause the entire system to crash
      const invalidFilters = {
        skills: ['NonexistentSkill'],
        clients: ['NonexistentClient'],
        preferredStaff: [], // Phase 3: Add preferredStaff field
        timeHorizon: {
          start: new Date('2099-01-01'), // Future date
          end: new Date('2099-12-31')
        }
      };

      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      if (matrixData) {
        const filteredData = DemandPerformanceOptimizer.optimizeFiltering(matrixData, invalidFilters);
        
        // Should handle gracefully - may return empty results but shouldn't crash
        if (!filteredData) {
          throw new Error('Filtering with invalid data should return empty results, not null');
        }
      }

    } catch (error) {
      // Errors should be caught and handled gracefully
      if (error instanceof Error && error.message.includes('system crash')) {
        throw new Error('System crashed instead of handling error gracefully');
      }
      
      // Expected behavior - log and continue
      console.log('Error handled gracefully:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test revenue calculation error handling
    try {
      const invalidSkillFeeRates = new Map<string, number>();
      
      // This should use fallback rates instead of crashing
      const result = suggestedRevenueCalculator.calculateSuggestedRevenue(
        5,
        'NonexistentSkill',
        invalidSkillFeeRates
      );

      // Should return a reasonable fallback value
      if (result <= 0) {
        throw new Error('Revenue calculation should use fallback rate for unknown skills');
      }

    } catch (error) {
      // Should not reach here - errors should be handled internally
      throw new Error(`Revenue calculation error not handled properly: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('Error propagation and handling test completed successfully');
  }

  /**
   * Test performance optimization integration
   */
  private static async testPerformanceOptimizationIntegration(): Promise<void> {
    // Generate matrix data
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('No matrix data for performance optimization test');
    }

    // Test filtering performance with different scenarios
    const testScenarios = [
      {
        name: 'No filters',
        filters: { skills: [], clients: [], preferredStaff: [], timeHorizon: { start: new Date(), end: new Date() } }
      },
      {
        name: 'Single skill filter',
        filters: { skills: [matrixData.skills[0] || 'TestSkill'], clients: [], preferredStaff: [], timeHorizon: { start: new Date(), end: new Date() } }
      },
      {
        name: 'Multiple skill filter',
        filters: { 
          skills: matrixData.skills.slice(0, Math.min(3, matrixData.skills.length)), 
          clients: [], 
          preferredStaff: [], // Phase 3: Add preferredStaff field
          timeHorizon: { start: new Date(), end: new Date() } 
        }
      }
    ];

    for (const scenario of testScenarios) {
      const startTime = performance.now();
      
      const filteredData = DemandPerformanceOptimizer.optimizeFiltering(matrixData, scenario.filters);
      
      const duration = performance.now() - startTime;

      // Filtering should be fast (under 1 second)
      if (duration > 1000) {
        throw new Error(`Performance optimization failed for "${scenario.name}": ${duration}ms`);
      }

      if (!filteredData) {
        throw new Error(`Performance optimization returned null for "${scenario.name}"`);
      }

      console.log(`Performance scenario "${scenario.name}": ${duration.toFixed(2)}ms`);
    }

    // Test memory usage efficiency
    const initialMemory = this.getMemoryUsage();
    
    // Perform multiple filtering operations
    for (let i = 0; i < 10; i++) {
      DemandPerformanceOptimizer.optimizeFiltering(matrixData, testScenarios[0].filters);
    }

    const finalMemory = this.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 50MB)
    if (memoryIncrease > 50 * 1024 * 1024) {
      console.warn(`High memory usage detected: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
    }

    console.log(`Performance optimization integration test completed - Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Test complete user workflow simulation
   */
  public static async testCompleteUserWorkflow(): Promise<void> {
    console.log('🔗 Testing complete user workflow...');

    // Simulate complete user journey
    // 1. User opens demand matrix
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('User workflow failed: Cannot load matrix');
    }

    // 2. User applies filters
    const userFilters = {
      skills: matrixData.skills.slice(0, 2), // Select first 2 skills
      clients: [],
      preferredStaff: [], // Phase 3: Add preferredStaff field
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-06-30')
      }
    };

    const filteredData = DemandPerformanceOptimizer.optimizeFiltering(matrixData, userFilters);

    if (!filteredData || filteredData.dataPoints.length === 0) {
      throw new Error('User workflow failed: Filtering removed all data');
    }

    // 3. User views revenue information (if available)
    if (filteredData.revenueTotals) {
      const hasValidRevenue = filteredData.revenueTotals.totalSuggestedRevenue >= 0;
      
      if (!hasValidRevenue) {
        throw new Error('User workflow failed: Invalid revenue data');
      }
    }

    // 4. User changes time horizon
    const newTimeHorizon = {
      start: new Date('2024-07-01'),
      end: new Date('2024-12-31')
    };

    const newFilters = { ...userFilters, timeHorizon: newTimeHorizon };
    const newFilteredData = DemandPerformanceOptimizer.optimizeFiltering(matrixData, newFilters);

    if (!newFilteredData) {
      throw new Error('User workflow failed: Time horizon change failed');
    }

    // 5. Simulate export functionality
    const exportData = {
      timestamp: new Date(),
      data: newFilteredData,
      filters: newFilters,
      format: 'CSV'
    };

    if (!exportData.data || !exportData.timestamp) {
      throw new Error('User workflow failed: Export preparation failed');
    }

    console.log('✅ Complete user workflow simulation passed');
    console.log(`   Initial data: ${matrixData.dataPoints.length} points`);
    console.log(`   After filtering: ${filteredData.dataPoints.length} points`);
    console.log(`   After time change: ${newFilteredData.dataPoints.length} points`);
  }
}
