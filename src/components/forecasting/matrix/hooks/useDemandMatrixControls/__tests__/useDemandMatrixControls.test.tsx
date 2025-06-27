import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDemandMatrixControls } from '../useDemandMatrixControls';
import { SkillType } from '@/types/task';

// Mock the external dependencies
vi.mock('@/hooks/useClients', () => ({
  useClients: vi.fn(() => ({
    data: [
      { id: 'client-1', name: 'Client 1' },
      { id: 'client-2', name: 'Client 2' }
    ],
    isLoading: false
  }))
}));

vi.mock('@/hooks/useSkills', () => ({
  useSkills: vi.fn(() => ({
    data: ['Tax Preparation', 'Audit', 'Advisory'] as SkillType[],
    isLoading: false
  }))
}));

vi.mock('../useMatrixFiltering', () => ({
  useMatrixFiltering: vi.fn(() => ({
    availableSkills: ['Tax Preparation', 'Audit', 'Advisory'] as SkillType[],
    availableClients: [
      { id: 'client-1', name: 'Client 1' },
      { id: 'client-2', name: 'Client 2' }
    ],
    isAllSkillsSelected: false,
    isAllClientsSelected: false
  }))
}));

vi.mock('../useMatrixExport', () => ({
  useMatrixExport: vi.fn(() => ({
    handleExport: vi.fn()
  }))
}));

vi.mock('../useAvailablePreferredStaff', () => ({
  useAvailablePreferredStaff: vi.fn(() => ({
    availablePreferredStaff: [
      { id: 'staff-1', name: 'Staff 1', roleTitle: 'Senior' },
      { id: 'staff-2', name: 'Staff 2', roleTitle: 'Junior' }
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn()
  }))
}));

describe('useDemandMatrixControls (Refactored)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      expect(result.current.selectedSkills).toEqual([]);
      expect(result.current.selectedClients).toEqual([]);
      expect(result.current.monthRange).toEqual({ start: 0, end: 11 });
      expect(result.current.selectedPreferredStaff).toEqual([]);
    });

    it('should provide all required properties', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      // State properties
      expect(result.current.selectedSkills).toBeDefined();
      expect(result.current.selectedClients).toBeDefined();
      expect(result.current.monthRange).toBeDefined();
      expect(result.current.selectedPreferredStaff).toBeDefined();

      // Handler functions
      expect(typeof result.current.handleSkillToggle).toBe('function');
      expect(typeof result.current.handleClientToggle).toBe('function');
      expect(typeof result.current.handleMonthRangeChange).toBe('function');
      expect(typeof result.current.handlePreferredStaffToggle).toBe('function');
      expect(typeof result.current.handleReset).toBe('function');
      expect(typeof result.current.handleExport).toBe('function');

      // Data arrays
      expect(Array.isArray(result.current.availableSkills)).toBe(true);
      expect(Array.isArray(result.current.availableClients)).toBe(true);
      expect(Array.isArray(result.current.availablePreferredStaff)).toBe(true);

      // Boolean flags
      expect(typeof result.current.skillsLoading).toBe('boolean');
      expect(typeof result.current.clientsLoading).toBe('boolean');
      expect(typeof result.current.preferredStaffLoading).toBe('boolean');
      expect(typeof result.current.isAllSkillsSelected).toBe('boolean');
      expect(typeof result.current.isAllClientsSelected).toBe('boolean');
      expect(typeof result.current.isAllPreferredStaffSelected).toBe('boolean');

      // Other properties
      expect(typeof result.current.refetchPreferredStaff).toBe('function');
    });
  });

  describe('skill management', () => {
    it('should toggle skill selection', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      act(() => {
        result.current.handleSkillToggle('Tax Preparation');
      });

      expect(result.current.selectedSkills).toContain('Tax Preparation');

      act(() => {
        result.current.handleSkillToggle('Tax Preparation');
      });

      expect(result.current.selectedSkills).not.toContain('Tax Preparation');
    });
  });

  describe('client management', () => {
    it('should toggle client selection', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'client' })
      );

      act(() => {
        result.current.handleClientToggle('client-1');
      });

      expect(result.current.selectedClients).toContain('client-1');

      act(() => {
        result.current.handleClientToggle('client-1');
      });

      expect(result.current.selectedClients).not.toContain('client-1');
    });
  });

  describe('preferred staff management', () => {
    it('should toggle preferred staff selection', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      act(() => {
        result.current.handlePreferredStaffToggle('staff-1');
      });

      expect(result.current.selectedPreferredStaff).toContain('staff-1');

      act(() => {
        result.current.handlePreferredStaffToggle('staff-1');
      });

      expect(result.current.selectedPreferredStaff).not.toContain('staff-1');
    });

    it('should handle mixed case staff IDs', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      act(() => {
        result.current.handlePreferredStaffToggle('STAFF-1');
      });

      // Should be normalized to lowercase
      expect(result.current.selectedPreferredStaff).toContain('staff-1');
      expect(result.current.selectedPreferredStaff).not.toContain('STAFF-1');
    });
  });

  describe('month range management', () => {
    it('should change month range', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      const newRange = { start: 2, end: 7 };

      act(() => {
        result.current.handleMonthRangeChange(newRange);
      });

      expect(result.current.monthRange).toEqual(newRange);
    });
  });

  describe('reset functionality', () => {
    it('should reset to default state', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      // Change some values first
      act(() => {
        result.current.handleSkillToggle('Tax Preparation');
        result.current.handleClientToggle('client-1');
        result.current.handlePreferredStaffToggle('staff-1');
        result.current.handleMonthRangeChange({ start: 2, end: 7 });
      });

      // Reset
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.monthRange).toEqual({ start: 0, end: 11 });
      expect(result.current.selectedPreferredStaff).toEqual([]);
    });
  });

  describe('backward compatibility', () => {
    it('should maintain the same public API as the original implementation', () => {
      const { result } = renderHook(() => 
        useDemandMatrixControls({ groupingMode: 'skill' })
      );

      // Verify all expected properties exist with correct types
      const expectedProperties = [
        'selectedSkills',
        'selectedClients', 
        'monthRange',
        'selectedPreferredStaff',
        'handleSkillToggle',
        'handleClientToggle',
        'handleMonthRangeChange',
        'handlePreferredStaffToggle',
        'handleReset',
        'handleExport',
        'availableSkills',
        'availableClients',
        'skillsLoading',
        'clientsLoading',
        'isAllSkillsSelected',
        'isAllClientsSelected',
        'availablePreferredStaff',
        'preferredStaffLoading',
        'preferredStaffError',
        'isAllPreferredStaffSelected',
        'refetchPreferredStaff'
      ];

      expectedProperties.forEach(prop => {
        expect(result.current).toHaveProperty(prop);
      });
    });
  });
});
