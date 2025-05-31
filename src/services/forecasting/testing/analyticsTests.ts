
import { TestResult } from './types';
import { TestUtils } from './testUtils';
import { EnhancedMatrixService } from '../enhancedMatrixService';
import { AdvancedAnalyticsService } from '../analyticsService';

/**
 * Analytics functionality tests
 */
export class AnalyticsTests {
  /**
   * Test analytics integration
   */
  static async testAnalyticsIntegration(): Promise<TestResult> {
    return TestUtils.executeTest('Analytics Integration', async () => {
      const { matrixData, trends, recommendations, alerts } = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: true,
        useCache: false
      });

      const validationIssues = [];
      
      if (trends.length !== matrixData.skills.length) {
        validationIssues.push(`Expected ${matrixData.skills.length} trends, got ${trends.length}`);
      }
      
      if (recommendations.length === 0) {
        validationIssues.push('No recommendations generated');
      }
      
      // Validate trend analysis
      const invalidTrends = trends.filter(trend => 
        !['increasing', 'decreasing', 'stable'].includes(trend.trend)
      );
      
      if (invalidTrends.length > 0) {
        validationIssues.push(`${invalidTrends.length} trends have invalid direction`);
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
   * Test alert generation
   */
  static async testAlertGeneration(): Promise<TestResult> {
    return TestUtils.executeTest('Alert Generation', async () => {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const alerts = AdvancedAnalyticsService.generateAlerts(matrixData);
      
      const validationIssues = [];
      
      // Validate alert structure
      const structureValidator = (alert: any) => 
        alert.id && alert.skill && alert.type && alert.severity && alert.message;
      
      validationIssues.push(...TestUtils.validateArrayStructure(alerts, structureValidator, 'alerts'));
      
      // Check severity levels
      const validSeverities = ['critical', 'warning', 'info'];
      const severityValidator = (alert: any) => validSeverities.includes(alert.severity);
      
      validationIssues.push(...TestUtils.validateArrayStructure(alerts, severityValidator, 'alerts with invalid severity'));

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        alertsCount: alerts.length,
        criticalCount: alerts.filter(a => a.severity === 'critical').length,
        warningCount: alerts.filter(a => a.severity === 'warning').length,
        infoCount: alerts.filter(a => a.severity === 'info').length,
        validationIssues
      };
    });
  }

  /**
   * Test recommendation engine
   */
  static async testRecommendationEngine(): Promise<TestResult> {
    return TestUtils.executeTest('Recommendation Engine', async () => {
      const { matrixData, trends } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const recommendations = AdvancedAnalyticsService.generateRecommendations(matrixData, trends);
      
      const validationIssues = [];
      
      // Validate recommendation structure
      const structureValidator = (rec: any) => 
        rec.skill && rec.type && rec.priority && rec.description;
      
      validationIssues.push(...TestUtils.validateArrayStructure(recommendations, structureValidator, 'recommendations'));
      
      // Check valid types and priorities
      const validTypes = ['hire', 'reduce', 'optimize', 'maintain'];
      const validPriorities = ['high', 'medium', 'low'];
      
      const typeValidator = (rec: any) => validTypes.includes(rec.type);
      const priorityValidator = (rec: any) => validPriorities.includes(rec.priority);
      
      validationIssues.push(...TestUtils.validateArrayStructure(recommendations, typeValidator, 'recommendations with invalid type'));
      validationIssues.push(...TestUtils.validateArrayStructure(recommendations, priorityValidator, 'recommendations with invalid priority'));

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        recommendationsCount: recommendations.length,
        highPriorityCount: recommendations.filter(r => r.priority === 'high').length,
        hireRecommendations: recommendations.filter(r => r.type === 'hire').length,
        optimizeRecommendations: recommendations.filter(r => r.type === 'optimize').length,
        validationIssues
      };
    });
  }

  /**
   * Test trend analysis
   */
  static async testTrendAnalysis(): Promise<TestResult> {
    return TestUtils.executeTest('Trend Analysis', async () => {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const trends = AdvancedAnalyticsService.analyzeTrends(matrixData);
      
      const validationIssues = [];
      
      if (trends.length !== matrixData.skills.length) {
        validationIssues.push(`Expected ${matrixData.skills.length} trends, got ${trends.length}`);
      }
      
      // Validate trend structure
      const structureValidator = (trend: any) => 
        trend.skill && 
        ['increasing', 'decreasing', 'stable'].includes(trend.trend) &&
        typeof trend.trendPercent === 'number' &&
        trend.prediction;
      
      validationIssues.push(...TestUtils.validateArrayStructure(trends, structureValidator, 'trends'));
      
      // Check predictions are reasonable
      const predictionValidator = (trend: any) => 
        trend.prediction.nextMonth >= 0 && trend.prediction.nextQuarter >= 0;
      
      validationIssues.push(...TestUtils.validateValueRanges(trends, predictionValidator, '{count} trends have negative predictions'));

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        trendsCount: trends.length,
        increasingCount: trends.filter(t => t.trend === 'increasing').length,
        decreasingCount: trends.filter(t => t.trend === 'decreasing').length,
        stableCount: trends.filter(t => t.trend === 'stable').length,
        validationIssues
      };
    });
  }
}
