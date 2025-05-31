
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMatrixControls } from '../useMatrixControls';
import { SkillType } from '@/types/task';

// Mock the useMatrixSkills hook
vi.mock('../../useMatrixSkills', () => ({
  useMatrixSkills: vi.fn(() => ({
    availableSkills: ['Tax Preparation', 'Audit', 'Advisory'] as SkillType[],
    isLoading: false,
    error: null,
    refetchSkills: vi.fn(),
    validateSkillSelection: vi.fn()
  }))
}));

describe('useMatrixControls (Refactored)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMatrixControls());

      expect(result.current.viewMode).toBe('hours');
      expect(result.current.monthRange).toEqual({ start: 0, end: 11 });
      expect(result.current.skillsLoading).toBe(false);
    });

    it('should initialize with custom initial state', () => {
      const initialState = {
        viewMode: 'percentage' as const,
        monthRange: { start: 3, end: 8 },
        selectedSkills: ['Tax Preparation'] as SkillType[]
      };

      const { result } = renderHook(() => 
        useMatrixControls({ initialState })
      );

      expect(result.current.viewMode).toBe('percentage');
      expect(result.current.monthRange).toEqual({ start: 3, end: 8 });
    });
  });

  describe('skill management', () => {
    it('should toggle skill selection', () => {
      const { result } = renderHook(() => useMatrixControls());

      act(() => {
        result.current.handleSkillToggle('Tax Preparation');
      });

      expect(result.current.selectedSkills).toContain('Tax Preparation');

      act(() => {
        result.current.handleSkillToggle('Tax Preparation');
      });

      expect(result.current.selectedSkills).not.toContain('Tax Preparation');
    });

    it('should handle matrix skills synchronization', () => {
      const matrixSkills = ['CPA', 'Senior Staff'] as SkillType[];
      
      const { result } = renderHook(() => 
        useMatrixControls({ matrixSkills })
      );

      expect(result.current.availableSkills).toEqual(
        expect.arrayContaining(['Tax Preparation', 'Audit', 'Advisory', 'CPA', 'Senior Staff'])
      );
    });
  });

  describe('view mode management', () => {
    it('should change view mode', () => {
      const { result } = renderHook(() => useMatrixControls());

      expect(result.current.viewMode).toBe('hours');

      act(() => {
        result.current.handleViewModeChange('percentage');
      });

      expect(result.current.viewMode).toBe('percentage');
    });
  });

  describe('month range management', () => {
    it('should change month range', () => {
      const { result } = renderHook(() => useMatrixControls());

      const newRange = { start: 2, end: 7 };

      act(() => {
        result.current.handleMonthRangeChange(newRange);
      });

      expect(result.current.monthRange).toEqual(newRange);
    });
  });

  describe('reset functionality', () => {
    it('should reset to default state', async () => {
      const { result } = renderHook(() => useMatrixControls());

      // Change some values
      act(() => {
        result.current.handleViewModeChange('percentage');
        result.current.handleMonthRangeChange({ start: 2, end: 7 });
      });

      // Reset
      await act(async () => {
        await result.current.handleReset();
      });

      expect(result.current.viewMode).toBe('hours');
      expect(result.current.monthRange).toEqual({ start: 0, end: 11 });
    });
  });

  describe('export functionality', () => {
    it('should have export handler', () => {
      const { result } = renderHook(() => useMatrixControls());

      expect(typeof result.current.handleExport).toBe('function');
    });
  });

  describe('public API compatibility', () => {
    it('should maintain the same public interface', () => {
      const { result } = renderHook(() => useMatrixControls());

      // Verify all expected properties exist
      const expectedProperties = [
        'selectedSkills',
        'viewMode', 
        'monthRange',
        'handleSkillToggle',
        'handleViewModeChange',
        'handleMonthRangeChange',
        'handleReset',
        'handleExport',
        'availableSkills',
        'skillsLoading'
      ];

      expectedProperties.forEach(prop => {
        expect(result.current).toHaveProperty(prop);
      });
    });
  });
});
