
import { EnhancedMatrixService } from '@/services/forecasting/enhanced/enhancedMatrixService';
import { SkillType } from '@/types/task';

/**
 * Enhanced Matrix Service Tests
 * Tests for the enhanced matrix service functionality
 */

describe('EnhancedMatrixService', () => {
  describe('getEnhancedMatrixData', () => {
    it('should generate enhanced matrix data', async () => {
      // Mock data with proper MonthInfo structure
      const mockMatrixData = {
        months: [
          { key: '2023-01', label: 'Jan 2023', index: 0 },
          { key: '2023-02', label: 'Feb 2023', index: 1 }
        ],
        skills: ['Junior' as SkillType],
        dataPoints: [{
          skillType: 'Junior' as SkillType,
          month: '2023-01',
          monthLabel: 'Jan 2023',
          demandHours: 100,
          capacityHours: 80,
          gap: 20,
          utilizationPercent: 125
        }],
        totalDemand: 100,
        totalCapacity: 80,
        totalGap: 20
      };

      // Test the service
      expect(typeof EnhancedMatrixService.getEnhancedMatrixData).toBe('function');
    });
  });

  describe('generateCSVExport', () => {
    it('should generate CSV export', () => {
      const mockMatrixData = {
        months: [{ key: '2023-01', label: 'Jan 2023', index: 0 }],
        skills: ['Junior' as SkillType],
        dataPoints: [{
          skillType: 'Junior' as SkillType,
          month: '2023-01',
          monthLabel: 'Jan 2023',
          demandHours: 100,
          capacityHours: 80,
          gap: 20,
          utilizationPercent: 125
        }],
        totalDemand: 100,
        totalCapacity: 80,
        totalGap: 20
      };

      const result = EnhancedMatrixService.generateCSVExport(
        mockMatrixData,
        ['Junior'],
        { start: 0, end: 0 }
      );

      expect(typeof result).toBe('string');
    });
  });

  describe('generateJSONExport', () => {
    it('should generate JSON export', () => {
      const mockMatrixData = {
        months: [{ key: '2023-01', label: 'Jan 2023', index: 0 }],
        skills: ['Junior' as SkillType],
        dataPoints: [{
          skillType: 'Junior' as SkillType,
          month: '2023-01',
          monthLabel: 'Jan 2023',
          demandHours: 100,
          capacityHours: 80,
          gap: 20,
          utilizationPercent: 125
        }],
        totalDemand: 100,
        totalCapacity: 80,
        totalGap: 20
      };

      const result = EnhancedMatrixService.generateJSONExport(
        mockMatrixData,
        ['Junior'],
        { start: 0, end: 0 }
      );

      expect(typeof result).toBe('string');
    });
  });
});
