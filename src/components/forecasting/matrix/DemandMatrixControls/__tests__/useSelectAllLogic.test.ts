
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSelectAllLogic } from '../hooks/useSelectAllLogic';

/**
 * Test suite for useSelectAllLogic hook
 * Ensures the extracted logic works correctly
 */
describe('useSelectAllLogic', () => {
  describe('Simple items (strings)', () => {
    it('should handle select all for simple items', () => {
      const items = ['A', 'B', 'C'];
      const selectedItems = ['A'];
      const onToggle = vi.fn();

      const { result } = renderHook(() =>
        useSelectAllLogic(items, selectedItems, onToggle)
      );

      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.selectAllText).toBe('All');

      act(() => {
        result.current.handleSelectAll();
      });

      // Should toggle unselected items
      expect(onToggle).toHaveBeenCalledWith('B');
      expect(onToggle).toHaveBeenCalledWith('C');
      expect(onToggle).toHaveBeenCalledTimes(2);
    });

    it('should handle deselect all for simple items', () => {
      const items = ['A', 'B', 'C'];
      const selectedItems = ['A', 'B', 'C'];
      const onToggle = vi.fn();

      const { result } = renderHook(() =>
        useSelectAllLogic(items, selectedItems, onToggle)
      );

      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.selectAllText).toBe('None');

      act(() => {
        result.current.handleSelectAll();
      });

      // Should toggle all selected items
      expect(onToggle).toHaveBeenCalledWith('A');
      expect(onToggle).toHaveBeenCalledWith('B');
      expect(onToggle).toHaveBeenCalledWith('C');
      expect(onToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Complex items (objects)', () => {
    it('should handle select all for complex items with ID getter', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
      ];
      const selectedItems = ['1'];
      const onToggle = vi.fn();
      const getItemId = (item: any) => item.id;

      const { result } = renderHook(() =>
        useSelectAllLogic(items, selectedItems, onToggle, getItemId)
      );

      expect(result.current.isAllSelected).toBe(false);

      act(() => {
        result.current.handleSelectAll();
      });

      // Should toggle unselected items
      expect(onToggle).toHaveBeenCalledWith({ id: '2', name: 'Item 2' });
      expect(onToggle).toHaveBeenCalledWith({ id: '3', name: 'Item 3' });
      expect(onToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty arrays', () => {
      const items: string[] = [];
      const selectedItems: string[] = [];
      const onToggle = vi.fn();

      const { result } = renderHook(() =>
        useSelectAllLogic(items, selectedItems, onToggle)
      );

      expect(result.current.isAllSelected).toBe(true); // Empty arrays are considered "all selected"
      expect(result.current.selectAllText).toBe('None');

      act(() => {
        result.current.handleSelectAll();
      });

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should handle no selected items', () => {
      const items = ['A', 'B', 'C'];
      const selectedItems: string[] = [];
      const onToggle = vi.fn();

      const { result } = renderHook(() =>
        useSelectAllLogic(items, selectedItems, onToggle)
      );

      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.selectAllText).toBe('All');

      act(() => {
        result.current.handleSelectAll();
      });

      // Should select all items
      expect(onToggle).toHaveBeenCalledWith('A');
      expect(onToggle).toHaveBeenCalledWith('B');
      expect(onToggle).toHaveBeenCalledWith('C');
      expect(onToggle).toHaveBeenCalledTimes(3);
    });
  });
});
