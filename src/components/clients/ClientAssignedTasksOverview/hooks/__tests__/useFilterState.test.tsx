
import { renderHook, act } from '@testing-library/react';
import { useFilterState } from '../useFilterState';

describe('useFilterState', () => {
  it('should initialize with default filter values', () => {
    const { result } = renderHook(() => useFilterState());
    
    expect(result.current.filters).toEqual({
      searchTerm: '',
      clientFilter: 'all',
      skillFilter: 'all',
      priorityFilter: 'all',
      statusFilter: 'all'
    });
  });

  it('should update individual filter values', () => {
    const { result } = renderHook(() => useFilterState());
    
    act(() => {
      result.current.updateFilter('searchTerm', 'test search');
    });
    
    expect(result.current.filters.searchTerm).toBe('test search');
    expect(result.current.filters.clientFilter).toBe('all'); // Other filters unchanged
  });

  it('should reset all filters to default values', () => {
    const { result } = renderHook(() => useFilterState());
    
    // First, change some filters
    act(() => {
      result.current.updateFilter('searchTerm', 'test');
      result.current.updateFilter('clientFilter', 'client1');
      result.current.updateFilter('priorityFilter', 'High');
    });
    
    // Verify filters were changed
    expect(result.current.filters.searchTerm).toBe('test');
    expect(result.current.filters.clientFilter).toBe('client1');
    expect(result.current.filters.priorityFilter).toBe('High');
    
    // Reset filters
    act(() => {
      result.current.resetFilters();
    });
    
    // Verify all filters are back to defaults
    expect(result.current.filters).toEqual({
      searchTerm: '',
      clientFilter: 'all',
      skillFilter: 'all',
      priorityFilter: 'all',
      statusFilter: 'all'
    });
  });

  it('should handle multiple sequential updates correctly', () => {
    const { result } = renderHook(() => useFilterState());
    
    act(() => {
      result.current.updateFilter('searchTerm', 'first');
    });
    
    act(() => {
      result.current.updateFilter('searchTerm', 'second');
    });
    
    act(() => {
      result.current.updateFilter('clientFilter', 'client1');
    });
    
    expect(result.current.filters.searchTerm).toBe('second');
    expect(result.current.filters.clientFilter).toBe('client1');
  });
});
