import { useState, useEffect, useCallback } from 'react';

interface DetailMatrixPreferences {
  viewMode: 'all-tasks' | 'group-by-skill';
  expandedSkillGroups: Set<string>;
  sortConfig: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filterPreferences?: {
    selectedSkills: string[];
    selectedClients: string[];
    selectedPreferredStaff: string[];
    monthRange: { start: number; end: number };
  };
}

const STORAGE_KEY = 'detail-matrix-preferences';

/**
 * Local Storage Persistence Hook - Phase 5
 * 
 * Saves and restores user preferences for Detail Matrix:
 * - View mode preference
 * - Expanded skill groups
 * - Sort preferences
 * - Optional filter preferences
 */
export const useLocalStoragePersistence = () => {
  const [preferences, setPreferences] = useState<DetailMatrixPreferences>({
    viewMode: 'all-tasks',
    expandedSkillGroups: new Set(),
    sortConfig: { field: 'taskName', direction: 'asc' }
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          ...parsed,
          expandedSkillGroups: new Set(parsed.expandedSkillGroups || [])
        });
      }
    } catch (error) {
      console.warn('Failed to load Detail Matrix preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<DetailMatrixPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    
    try {
      const toStore = {
        ...updated,
        expandedSkillGroups: Array.from(updated.expandedSkillGroups)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      setPreferences(updated);
    } catch (error) {
      console.warn('Failed to save Detail Matrix preferences:', error);
    }
  }, [preferences]);

  // Individual preference setters
  const setViewMode = useCallback((viewMode: 'all-tasks' | 'group-by-skill') => {
    savePreferences({ viewMode });
  }, [savePreferences]);

  const toggleSkillGroupExpansion = useCallback((skillName: string) => {
    const newExpandedGroups = new Set(preferences.expandedSkillGroups);
    if (newExpandedGroups.has(skillName)) {
      newExpandedGroups.delete(skillName);
    } else {
      newExpandedGroups.add(skillName);
    }
    savePreferences({ expandedSkillGroups: newExpandedGroups });
  }, [preferences.expandedSkillGroups, savePreferences]);

  const setSortConfig = useCallback((sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    savePreferences({ sortConfig });
  }, [savePreferences]);

  const setFilterPreferences = useCallback((filterPreferences: DetailMatrixPreferences['filterPreferences']) => {
    savePreferences({ filterPreferences });
  }, [savePreferences]);

  // Clear all preferences
  const clearPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences({
        viewMode: 'all-tasks',
        expandedSkillGroups: new Set(),
        sortConfig: { field: 'taskName', direction: 'asc' }
      });
    } catch (error) {
      console.warn('Failed to clear Detail Matrix preferences:', error);
    }
  }, []);

  return {
    preferences,
    setViewMode,
    toggleSkillGroupExpansion,
    setSortConfig,
    setFilterPreferences,
    clearPreferences,
    savePreferences
  };
};

/**
 * Keyboard Navigation Hook - Phase 5
 * 
 * Provides keyboard navigation for Detail Matrix:
 * - Arrow keys for navigation
 * - Enter to expand/collapse skill groups
 * - Tab navigation support
 */
export const useKeyboardNavigation = (
  tasks: any[],
  expandedGroups: Set<string>,
  onToggleExpansion: (skillName: string) => void
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedGroup, setFocusedGroup] = useState<string | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, tasks.length - 1));
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, -1));
        break;
        
      case 'Enter':
        if (focusedGroup) {
          event.preventDefault();
          onToggleExpansion(focusedGroup);
        }
        break;
        
      case 'Escape':
        setFocusedIndex(-1);
        setFocusedGroup(null);
        break;
    }
  }, [tasks.length, focusedGroup, onToggleExpansion]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    focusedGroup,
    setFocusedGroup,
    setFocusedIndex
  };
};