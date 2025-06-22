
import { useCallback } from 'react';

interface UseSelectAllLogicProps<T extends string> {
  selectedItems: T[];
  setSelectedItems: (items: T[]) => void;
  availableItems: T[];
  itemType: string;
}

export const useSelectAllLogic = <T extends string>({
  selectedItems,
  setSelectedItems,
  availableItems,
  itemType
}: UseSelectAllLogicProps<T>) => {
  const isAllSelected = availableItems.length > 0 && selectedItems.length === availableItems.length;
  
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect all
      setSelectedItems([]);
      console.log(`Deselected all ${itemType}s`);
    } else {
      // Select all - ensure type safety by casting available items to T[]
      const typedItems = availableItems.filter((item): item is T => typeof item === 'string');
      setSelectedItems(typedItems);
      console.log(`Selected all ${itemType}s:`, typedItems);
    }
  }, [isAllSelected, setSelectedItems, availableItems, itemType]);

  return {
    isAllSelected,
    handleSelectAll
  };
};
