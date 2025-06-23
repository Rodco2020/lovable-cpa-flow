
import { isAllItemsSelected, getMonthNames, createToggleToSetterAdapter } from '../utils/selectionUtils';

describe('selectionUtils', () => {
  describe('isAllItemsSelected', () => {
    it('returns true when no items are selected (showing all)', () => {
      expect(isAllItemsSelected([], ['item1', 'item2', 'item3'])).toBe(true);
    });

    it('returns true when all items are selected', () => {
      expect(isAllItemsSelected(['item1', 'item2', 'item3'], ['item1', 'item2', 'item3'])).toBe(true);
    });

    it('returns false when some items are selected', () => {
      expect(isAllItemsSelected(['item1', 'item2'], ['item1', 'item2', 'item3'])).toBe(false);
    });

    it('handles empty available items array', () => {
      expect(isAllItemsSelected([], [])).toBe(true);
    });
  });

  describe('getMonthNames', () => {
    it('returns correct month abbreviations', () => {
      const months = getMonthNames();
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('Jan');
      expect(months[11]).toBe('Dec');
      expect(months[5]).toBe('Jun');
    });
  });

  describe('createToggleToSetterAdapter', () => {
    it('calls toggle function for added items', () => {
      const mockToggle = jest.fn();
      const currentItems = ['item1', 'item2'];
      const adapter = createToggleToSetterAdapter(currentItems, mockToggle);
      
      adapter(['item1', 'item2', 'item3']);
      
      expect(mockToggle).toHaveBeenCalledWith('item3');
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('calls toggle function for removed items', () => {
      const mockToggle = jest.fn();
      const currentItems = ['item1', 'item2', 'item3'];
      const adapter = createToggleToSetterAdapter(currentItems, mockToggle);
      
      adapter(['item1', 'item3']);
      
      expect(mockToggle).toHaveBeenCalledWith('item2');
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('handles both additions and removals', () => {
      const mockToggle = jest.fn();
      const currentItems = ['item1', 'item2'];
      const adapter = createToggleToSetterAdapter(currentItems, mockToggle);
      
      adapter(['item2', 'item3']);
      
      expect(mockToggle).toHaveBeenCalledWith('item1'); // removed
      expect(mockToggle).toHaveBeenCalledWith('item3'); // added
      expect(mockToggle).toHaveBeenCalledTimes(2);
    });

    it('handles no changes correctly', () => {
      const mockToggle = jest.fn();
      const currentItems = ['item1', 'item2'];
      const adapter = createToggleToSetterAdapter(currentItems, mockToggle);
      
      adapter(['item1', 'item2']);
      
      expect(mockToggle).not.toHaveBeenCalled();
    });
  });
});
