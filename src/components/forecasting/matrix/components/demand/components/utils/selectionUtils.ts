
/**
 * Utility functions for handling selection state logic in matrix controls
 */

/**
 * Determines if all items are selected based on selection arrays
 * @param selectedItems - Array of currently selected items
 * @param availableItems - Array of all available items
 * @returns true if all items are selected or no items are specifically selected (showing all)
 */
export const isAllItemsSelected = (selectedItems: string[], availableItems: any[]): boolean => {
  return selectedItems.length === 0 || selectedItems.length === availableItems.length;
};

/**
 * Gets month names array for display purposes
 * @returns Array of abbreviated month names
 */
export const getMonthNames = (): string[] => [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Converts toggle function to setter function for components expecting array setters
 * @param selectedItems - Currently selected items
 * @param toggleFunction - Function that toggles individual items
 * @returns Function that accepts new array and applies necessary toggles
 */
export const createToggleToSetterAdapter = (
  selectedItems: string[],
  toggleFunction: (item: string) => void
) => {
  return (newItems: string[]) => {
    const currentSet = new Set(selectedItems);
    const newSet = new Set(newItems);
    
    // Find items that were added or removed
    const toAdd = newItems.filter(id => !currentSet.has(id));
    const toRemove = selectedItems.filter(id => !newSet.has(id));
    
    // Apply toggles for added items
    toAdd.forEach(item => toggleFunction(item));
    // Apply toggles for removed items
    toRemove.forEach(item => toggleFunction(item));
  };
};
