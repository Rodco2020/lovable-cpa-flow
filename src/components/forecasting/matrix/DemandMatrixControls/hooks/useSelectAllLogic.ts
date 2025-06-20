
/**
 * Hook for managing select all/none logic across different filter types
 * Provides consistent behavior for skills, clients, and preferred staff filters
 */
export const useSelectAllLogic = <T>(
  availableItems: T[],
  selectedItems: T[],
  onItemToggle: (item: T) => void,
  getKey?: (item: T) => string
) => {
  const isAllSelected = selectedItems.length === availableItems.length;
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all - toggle each selected item to deselect it
      selectedItems.forEach(item => onItemToggle(item));
    } else {
      // Select all - toggle each unselected item to select it
      availableItems.forEach(item => {
        const itemKey = getKey ? getKey(item) : item as string;
        const selectedKeys = getKey ? selectedItems.map(getKey) : selectedItems.map(item => item as string);
        
        if (!selectedKeys.includes(itemKey)) {
          onItemToggle(item);
        }
      });
    }
  };

  const selectAllText = isAllSelected ? 'None' : 'All';

  return {
    isAllSelected,
    handleSelectAll,
    selectAllText
  };
};
