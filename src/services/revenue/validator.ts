
/**
 * Revenue Data Validator
 * 
 * Handles validation of revenue data
 */

import { RevenueDataAccess } from './dataAccess';
import { RevenueValidationResult } from './types';

export class RevenueValidator {
  private dataAccess: RevenueDataAccess;

  constructor(dataAccess: RevenueDataAccess) {
    this.dataAccess = dataAccess;
  }

  /**
   * Validate revenue data consistency for a client
   */
  async validateRevenueData(clientId: string): Promise<RevenueValidationResult> {
    const issues: string[] = [];

    try {
      const client = await this.dataAccess.getClient(clientId);

      if (!client?.expected_monthly_revenue || client.expected_monthly_revenue <= 0) {
        issues.push('Client has no expected monthly revenue set');
      }

      // Additional validation logic would go here

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push('Failed to validate revenue data');
      return {
        isValid: false,
        issues
      };
    }
  }
}
