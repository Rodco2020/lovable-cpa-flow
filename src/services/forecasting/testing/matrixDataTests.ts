
import { TestResult } from './types';
import { TestUtils } from './testUtils';
import { EnhancedMatrixService } from '../enhancedMatrixService';

/**
 * Matrix data validation tests
 */
export class MatrixDataTests {
  /**
   * Test matrix data generation
   */
  static async testMatrixDataGeneration(): Promise<TestResult> {
    return TestUtils.executeTest('Matrix Data Generation', async () => {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: false,
        useCache: false
      });

      const validationIssues = [];
      
      if (!matrixData.months || matrixData.months.length !== 12) {
        validationIssues.push('Invalid months count');
      }
      
      if (!matrixData.skills || matrixData.skills.length === 0) {
        validationIssues.push('No skills found');
      }
      
      if (!matrixData.dataPoints || matrixData.dataPoints.length === 0) {
        validationIssues.push('No data points found');
      }

      const expectedDataPoints = matrixData.months.length * matrixData.skills.length;
      if (matrixData.dataPoints.length !== expectedDataPoints) {
        validationIssues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}`);
      }

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        monthsCount: matrixData.months.length,
        skillsCount: matrixData.skills.length,
        dataPointsCount: matrixData.dataPoints.length,
        validationIssues
      };
    });
  }

  /**
   * Test drill-down data functionality
   */
  static async testDrillDownData(): Promise<TestResult> {
    return TestUtils.executeTest('Drill-down Data', async () => {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      
      if (matrixData.skills.length === 0 || matrixData.months.length === 0) {
        throw new Error('No skills or months available for testing');
      }
      
      const skill = matrixData.skills[0];
      const month = matrixData.months[0].key;
      
      const drillDownData = await EnhancedMatrixService.getDrillDownData(skill, month, matrixData);
      
      const validationIssues = [];
      
      if (!drillDownData.demandBreakdown || drillDownData.demandBreakdown.length === 0) {
        validationIssues.push('No demand breakdown data');
      }
      
      if (!drillDownData.capacityBreakdown || drillDownData.capacityBreakdown.length === 0) {
        validationIssues.push('No capacity breakdown data');
      }
      
      if (!drillDownData.trends) {
        validationIssues.push('No trends data');
      }

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        skill,
        month,
        demandBreakdownCount: drillDownData.demandBreakdown.length,
        capacityBreakdownCount: drillDownData.capacityBreakdown.length,
        validationIssues
      };
    });
  }
}
