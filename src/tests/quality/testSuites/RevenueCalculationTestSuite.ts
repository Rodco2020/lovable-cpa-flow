
/**
 * Revenue Calculation Test Suite
 * 
 * Tests for revenue calculation accuracy and consistency
 */

import { suggestedRevenueCalculator } from '@/services/forecasting/demand/calculators/SuggestedRevenueCalculator';
import { getDefaultFeeRates } from '@/services/skills/feeRateService';

export class RevenueCalculationTestSuite {
  /**
   * Run all revenue calculation tests
   */
  public static async runTests(): Promise<{ passed: boolean; duration: number; error?: string }> {
    const startTime = Date.now();

    try {
      console.log('💰 [REVENUE CALCULATION TESTS] Starting test suite...');

      // Test 1: Basic revenue calculation
      await this.testBasicRevenueCalculation();
      console.log('✅ Basic revenue calculation test passed');

      // Test 2: Bulk revenue calculation
      await this.testBulkRevenueCalculation();
      console.log('✅ Bulk revenue calculation test passed');

      // Test 3: Fallback rate handling
      await this.testFallbackRateHandling();
      console.log('✅ Fallback rate handling test passed');

      // Test 4: Expected vs suggested calculation
      await this.testExpectedVsSuggestedCalculation();
      console.log('✅ Expected vs suggested calculation test passed');

      // Test 5: Edge cases and error handling
      await this.testEdgeCasesAndErrorHandling();
      console.log('✅ Edge cases and error handling test passed');

      const duration = Date.now() - startTime;
      console.log(`✅ [REVENUE CALCULATION TESTS] All tests passed in ${duration}ms`);

      return { passed: true, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ [REVENUE CALCULATION TESTS] Test failed: ${errorMessage}`);
      
      return { 
        passed: false, 
        duration, 
        error: errorMessage 
      };
    }
  }

  /**
   * Test basic revenue calculation
   */
  private static async testBasicRevenueCalculation(): Promise<void> {
    const skillFeeRates = new Map([
      ['Tax Preparation', 85.00],
      ['Audit Services', 120.00],
      ['Advisory Services', 150.00]
    ]);

    // Test standard calculation
    const result1 = suggestedRevenueCalculator.calculateSuggestedRevenue(
      10, // 10 hours
      'Tax Preparation',
      skillFeeRates
    );

    if (result1 !== 850.00) {
      throw new Error(`Expected 850.00, got ${result1}`);
    }

    // Test with different skill
    const result2 = suggestedRevenueCalculator.calculateSuggestedRevenue(
      5, // 5 hours
      'Advisory Services',
      skillFeeRates
    );

    if (result2 !== 750.00) {
      throw new Error(`Expected 750.00, got ${result2}`);
    }
  }

  /**
   * Test bulk revenue calculation
   */
  private static async testBulkRevenueCalculation(): Promise<void> {
    const skillFeeRates = new Map([
      ['Tax Preparation', 85.00],
      ['Audit Services', 120.00],
      ['Advisory Services', 150.00]
    ]);

    const demandData = [
      { skillName: 'Tax Preparation', demandHours: 10 },
      { skillName: 'Audit Services', demandHours: 8 },
      { skillName: 'Advisory Services', demandHours: 6 }
    ];

    const results = suggestedRevenueCalculator.bulkCalculateSuggestedRevenue(
      demandData,
      skillFeeRates
    );

    if (results.length !== 3) {
      throw new Error(`Expected 3 results, got ${results.length}`);
    }

    // Check individual calculations
    const taxResult = results.find(r => r.skillName === 'Tax Preparation');
    if (!taxResult || taxResult.suggestedRevenue !== 850.00) {
      throw new Error(`Tax preparation calculation incorrect: ${taxResult?.suggestedRevenue}`);
    }

    const auditResult = results.find(r => r.skillName === 'Audit Services');
    if (!auditResult || auditResult.suggestedRevenue !== 960.00) {
      throw new Error(`Audit services calculation incorrect: ${auditResult?.suggestedRevenue}`);
    }

    // Check total
    const totalRevenue = suggestedRevenueCalculator.getTotalSuggestedRevenue(results);
    const expectedTotal = 850.00 + 960.00 + 900.00; // 2710.00
    
    if (totalRevenue !== expectedTotal) {
      throw new Error(`Expected total ${expectedTotal}, got ${totalRevenue}`);
    }
  }

  /**
   * Test fallback rate handling
   */
  private static async testFallbackRateHandling(): Promise<void> {
    const skillFeeRates = new Map<string, number>(); // Empty map to force fallback

    // Test with skill not in rate map
    const result = suggestedRevenueCalculator.calculateSuggestedRevenue(
      4, // 4 hours
      'Unknown Skill',
      skillFeeRates
    );

    // Should use default fallback rate (75.00)
    if (result !== 300.00) {
      throw new Error(`Expected fallback calculation 300.00, got ${result}`);
    }

    // Test detailed calculation to check fallback flag
    const detailedResult = suggestedRevenueCalculator.calculateSuggestedRevenueDetailed(
      4,
      'Unknown Skill',
      skillFeeRates
    );

    if (!detailedResult.isUsingFallback) {
      throw new Error('Expected fallback flag to be true');
    }

    if (detailedResult.feeRate !== 75.00) {
      throw new Error(`Expected fallback rate 75.00, got ${detailedResult.feeRate}`);
    }
  }

  /**
   * Test expected vs suggested calculation
   */
  private static async testExpectedVsSuggestedCalculation(): Promise<void> {
    const expectedRevenue = 1200.00;
    const suggestedRevenue = 1000.00;

    const difference = suggestedRevenueCalculator.calculateExpectedLessSuggested(
      expectedRevenue,
      suggestedRevenue
    );

    if (difference !== 200.00) {
      throw new Error(`Expected difference 200.00, got ${difference}`);
    }

    // Test negative difference
    const negativeDifference = suggestedRevenueCalculator.calculateExpectedLessSuggested(
      800.00,
      1000.00
    );

    if (negativeDifference !== -200.00) {
      throw new Error(`Expected negative difference -200.00, got ${negativeDifference}`);
    }
  }

  /**
   * Test edge cases and error handling
   */
  private static async testEdgeCasesAndErrorHandling(): Promise<void> {
    const skillFeeRates = new Map([['Valid Skill', 100.00]]);

    // Test zero hours
    const zeroResult = suggestedRevenueCalculator.calculateSuggestedRevenue(
      0,
      'Valid Skill',
      skillFeeRates
    );

    if (zeroResult !== 0.00) {
      throw new Error(`Expected 0.00 for zero hours, got ${zeroResult}`);
    }

    // Test negative hours (should throw error)
    try {
      suggestedRevenueCalculator.calculateSuggestedRevenue(
        -5,
        'Valid Skill',
        skillFeeRates
      );
      throw new Error('Expected error for negative hours');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('non-negative')) {
        throw new Error('Expected validation error for negative hours');
      }
    }

    // Test empty skill name (should throw error)
    try {
      suggestedRevenueCalculator.calculateSuggestedRevenue(
        5,
        '',
        skillFeeRates
      );
      throw new Error('Expected error for empty skill name');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('non-empty')) {
        throw new Error('Expected validation error for empty skill name');
      }
    }

    // Test invalid expected/suggested values
    try {
      suggestedRevenueCalculator.calculateExpectedLessSuggested(NaN, 100);
      throw new Error('Expected error for NaN expected revenue');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('valid number')) {
        throw new Error('Expected validation error for NaN values');
      }
    }
  }

  /**
   * Test specific client calculations (White Plains Realty Inc)
   */
  public static async testWhitePlainsRealtyCalculations(): Promise<void> {
    console.log('🧪 Testing 2200 White Plains Road Realty Inc calculations...');
    
    // This would implement specific client calculation validation
    const skillFeeRates = new Map([
      ['Tax Preparation', 85.00],
      ['Bookkeeping', 65.00],
      ['Advisory Services', 150.00]
    ]);

    // Example calculation for White Plains Realty
    const monthlyTaxHours = 12;
    const monthlyBookkeepingHours = 8;
    const quarterlyAdvisoryHours = 4;

    const taxRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
      monthlyTaxHours,
      'Tax Preparation',
      skillFeeRates
    );

    const bookkeepingRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
      monthlyBookkeepingHours,
      'Bookkeeping',
      skillFeeRates
    );

    const advisoryRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
      quarterlyAdvisoryHours,
      'Advisory Services',
      skillFeeRates
    );

    const totalMonthlyRevenue = taxRevenue + bookkeepingRevenue + (advisoryRevenue / 3);

    // Validate against expected values (these would be provided in requirements)
    const expectedMonthlyRevenue = 1720.00; // Example expected value
    const tolerance = 50.00; // Allow some tolerance

    if (Math.abs(totalMonthlyRevenue - expectedMonthlyRevenue) > tolerance) {
      throw new Error(
        `White Plains Realty calculation mismatch: expected ~${expectedMonthlyRevenue}, got ${totalMonthlyRevenue.toFixed(2)}`
      );
    }

    console.log('✅ White Plains Realty calculations validated');
  }

  /**
   * Test specific client calculations (Batfer Food Corp)
   */
  public static async testBatferFoodCorpCalculations(): Promise<void> {
    console.log('🧪 Testing Batfer Food Corp calculations...');
    
    const skillFeeRates = new Map([
      ['Tax Preparation', 85.00],
      ['Audit Services', 120.00],
      ['Compliance', 95.00]
    ]);

    // Example calculation for Batfer Food Corp
    const monthlyComplianceHours = 15;
    const quarterlyTaxHours = 25;
    const annualAuditHours = 40;

    const complianceRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
      monthlyComplianceHours,
      'Compliance',
      skillFeeRates
    );

    const taxRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
      quarterlyTaxHours,
      'Tax Preparation',
      skillFeeRates
    );

    const auditRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
      annualAuditHours,
      'Audit Services',
      skillFeeRates
    );

    const totalMonthlyRevenue = complianceRevenue + (taxRevenue / 3) + (auditRevenue / 12);

    // Validate against expected values
    const expectedMonthlyRevenue = 2533.33; // Example expected value
    const tolerance = 100.00; // Allow some tolerance

    if (Math.abs(totalMonthlyRevenue - expectedMonthlyRevenue) > tolerance) {
      throw new Error(
        `Batfer Food Corp calculation mismatch: expected ~${expectedMonthlyRevenue}, got ${totalMonthlyRevenue.toFixed(2)}`
      );
    }

    console.log('✅ Batfer Food Corp calculations validated');
  }
}
