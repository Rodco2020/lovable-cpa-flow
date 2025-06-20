
import { useCallback } from 'react';

/**
 * Custom hook for handling "select all" logic
 * Extracted for reuse across different filter components
 */
export const useSelectAllLogic = <T>(
  items: T[],
  selectedItems: T[],
  onToggle: (item: T) => void,
  getItemId?: (item: T) => string
) => {
  const isAllSelected = selectedItems.length === items.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect all - toggle each selected item
      selectedItems.forEach(onToggle);
    } else {
      // Select all - toggle each unselected item
      const unselectedItems = items.filter(item => {
        const itemId = getItemId ? getItemId(item) : item;
        const selectedId = getItemId ? selectedItems.map(getItemId) : selectedItems;
        return !selectedId.includes(itemId as any);
      });
      unselectedItems.forEach(onToggle);
    }
  }, [items, selectedItems, onToggle, isAllSelected, getItemId]);

  return {
    isAllSelected,
    handleSelectAll,
    selectAllText: isAllSelected ? 'None' : 'All'
  };
};
