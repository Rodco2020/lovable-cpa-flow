
import { TestResult } from './types';
import { TestUtils } from './testUtils';
import { EnhancedMatrixService } from '../enhancedMatrixService';
import { SkillsIntegrationService } from '../skillsIntegrationService';

/**
 * Analytics and integration validation tests
 */
export class AnalyticsTests {
  /**
   * Test analytics integration
   */
  static async testAnalyticsIntegration(): Promise<TestResult> {
    return TestUtils.executeTest('Analytics Integration', async () => {
      const { trends, recommendations, alerts } = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: true,
        useCache: false
      });

      const validationIssues = [];
      
      if (!Array.isArray(trends)) {
        validationIssues.push('Trends is not an array');
      }
      
      if (!Array.isArray(recommendations)) {
        validationIssues.push('Recommendations is not an array');
      }
      
      if (!Array.isArray(alerts)) {
        validationIssues.push('Alerts is not an array');
      }

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        trendsCount: trends.length,
        recommendationsCount: recommendations.length,
        alertsCount: alerts.length,
        validationIssues
      };
    });
  }

  /**
   * Test skills integration
   */
  static async testSkillsIntegration(): Promise<TestResult> {
    return TestUtils.executeTest('Skills Integration', async () => {
      const skills = await SkillsIntegrationService.getAvailableSkills();
      
      const validationIssues = [];
      
      if (!Array.isArray(skills)) {
        validationIssues.push('Skills is not an array');
      }
      
      if (skills.length === 0) {
        validationIssues.push('No skills available');
      }
      
      // Test skill validation
      const { valid, invalid } = await SkillsIntegrationService.validateSkills(skills);
      
      if (valid.length !== skills.length) {
        validationIssues.push('Some skills failed validation');
      }

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        skillsCount: skills.length,
        validSkills: valid.length,
        invalidSkills: invalid.length,
        validationIssues
      };
    });
  }

  /**
   * Test alert generation
   */
  static async testAlertGeneration(): Promise<TestResult> {
    return TestUtils.executeTest('Alert Generation', async () => {
      const { matrixData, alerts } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      
      const validationIssues = [];
      
      // Alerts should be generated for significant gaps
      const significantGaps = matrixData.dataPoints.filter(point => Math.abs(point.gap) > 20);
      
      if (significantGaps.length > 0 && alerts.length === 0) {
        validationIssues.push('No alerts generated despite significant gaps');
      }

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        alertsGenerated: alerts.length,
        significantGaps: significantGaps.length,
        validationIssues
      };
    });
  }

  /**
   * Test recommendation engine
   */
  static async testRecommendationEngine(): Promise<TestResult> {
    return TestUtils.executeTest('Recommendation Engine', async () => {
      const { matrixData, recommendations } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      
      const validationIssues = [];
      
      // Check that recommendations have required fields
      recommendations.forEach((rec, index) => {
        if (!rec.skill || !rec.description || !rec.priority) {
          validationIssues.push(`Recommendation ${index} missing required fields`);
        }
      });

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        recommendationsCount: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'high').length,
        validationIssues
      };
    });
  }

  /**
   * Test trend analysis
   */
  static async testTrendAnalysis(): Promise<TestResult> {
    return TestUtils.executeTest('Trend Analysis', async () => {
      const { trends } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      
      const validationIssues = [];
      
      // Check that trends have required fields
      trends.forEach((trend, index) => {
        if (!trend.skill || !trend.trend || !trend.confidence) {
          validationIssues.push(`Trend ${index} missing required fields`);
        }
      });

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        trendsCount: trends.length,
        increasingTrends: trends.filter(t => t.trend === 'increasing').length,
        decreasingTrends: trends.filter(t => t.trend === 'decreasing').length,
        validationIssues
      };
    });
  }
}
