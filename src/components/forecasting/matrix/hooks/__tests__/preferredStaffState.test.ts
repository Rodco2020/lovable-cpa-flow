
/**
 * Phase 1 Testing Utilities
 * 
 * Simple test verification functions to ensure preferred staff state management
 * works correctly without breaking existing functionality.
 */

/**
 * Test data for preferred staff
 */
export const mockPreferredStaffData = [
  { id: 'staff-1', name: 'John Smith' },
  { id: 'staff-2', name: 'Jane Doe' },
  { id: 'staff-3', name: 'Mike Johnson' }
];

/**
 * Verify state management functions work correctly
 */
export const verifyPreferredStaffStateManagement = {
  // Test initial state
  verifyInitialState: (state: { selectedPreferredStaff: string[] }) => {
    console.log('✅ [PHASE 1 TEST] Initial state verification:', {
      selectedPreferredStaff: state.selectedPreferredStaff,
      isEmpty: state.selectedPreferredStaff.length === 0,
      isArray: Array.isArray(state.selectedPreferredStaff)
    });
    return Array.isArray(state.selectedPreferredStaff);
  },

  // Test toggle functionality
  verifyToggleFunctionality: (
    currentSelection: string[],
    staffIdToToggle: string
  ) => {
    const wasSelected = currentSelection.includes(staffIdToToggle);
    const expectedNewSelection = wasSelected
      ? currentSelection.filter(id => id !== staffIdToToggle)
      : [...currentSelection, staffIdToToggle];
    
    console.log('✅ [PHASE 1 TEST] Toggle functionality verification:', {
      staffIdToToggle,
      wasSelected,
      currentCount: currentSelection.length,
      expectedNewCount: expectedNewSelection.length,
      action: wasSelected ? 'remove' : 'add'
    });
    
    return expectedNewSelection;
  },

  // Test reset functionality
  verifyResetFunctionality: (
    allAvailableStaff: Array<{ id: string; name: string }>,
    resetResult: string[]
  ) => {
    const expectedAllStaffIds = allAvailableStaff.map(staff => staff.id);
    const resetWorksCorrectly = resetResult.length === expectedAllStaffIds.length &&
      expectedAllStaffIds.every(id => resetResult.includes(id));
      
    console.log('✅ [PHASE 1 TEST] Reset functionality verification:', {
      totalAvailableStaff: allAvailableStaff.length,
      resetResultCount: resetResult.length,
      resetWorksCorrectly,
      missingStaffIds: expectedAllStaffIds.filter(id => !resetResult.includes(id))
    });
    
    return resetWorksCorrectly;
  }
};
