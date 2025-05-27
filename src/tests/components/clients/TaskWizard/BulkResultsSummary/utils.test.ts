
/**
 * Bulk Results Summary Utils Tests
 * 
 * Unit tests for utility functions used in bulk results summary.
 */

import { formatTime, calculateSuccessRate, generateCSVData } from '../../../../../components/clients/TaskWizard/BulkResultsSummary/utils';
import { BulkOperationResult } from '../../../../../components/clients/TaskWizard/types';

describe('BulkResultsSummary Utils', () => {
  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(5000)).toBe('5s');
      expect(formatTime(30000)).toBe('30s');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatTime(65000)).toBe('1m 5s');
      expect(formatTime(125000)).toBe('2m 5s');
    });

    it('should handle zero time', () => {
      expect(formatTime(0)).toBe('0s');
    });
  });

  describe('calculateSuccessRate', () => {
    it('should calculate success rate correctly', () => {
      const result: BulkOperationResult = {
        totalOperations: 10,
        successfulOperations: 8,
        failedOperations: 2,
        errors: [],
        processingTime: 1000,
        results: []
      };

      expect(calculateSuccessRate(result)).toBe(80);
    });

    it('should handle zero total operations', () => {
      const result: BulkOperationResult = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        errors: [],
        processingTime: 1000,
        results: []
      };

      expect(calculateSuccessRate(result)).toBe(0);
    });
  });

  describe('generateCSVData', () => {
    it('should generate CSV data correctly', () => {
      const result: BulkOperationResult = {
        totalOperations: 2,
        successfulOperations: 1,
        failedOperations: 1,
        errors: [{ clientId: 'client-1', templateId: 'template-1', error: 'Test error' }],
        processingTime: 1000,
        results: [{ id: 'task-1', name: 'Test Task', client_id: 'client-1', template_id: 'template-1', status: 'active' }]
      };

      const csv = generateCSVData(result);
      expect(csv).toContain('Operation,Status,Client ID,Template ID,Error Message');
      expect(csv).toContain('Operation 1,Success,client-1,template-1,');
      expect(csv).toContain('Error 1,Failed,client-1,template-1,Test error');
    });
  });
});
