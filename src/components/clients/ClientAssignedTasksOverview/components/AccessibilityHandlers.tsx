
import { createScreenReaderAnnouncement } from '../utils/accessibilityUtils';

/**
 * AccessibilityHandlers
 * 
 * Utility class for managing accessibility announcements and interactions
 * in the Client Assigned Tasks Overview component.
 */
export class AccessibilityHandlers {
  /**
   * Handle view changes with accessibility announcements
   */
  static handleViewChange = (
    view: 'tasks' | 'dashboard',
    setActiveView: (view: 'tasks' | 'dashboard') => void
  ) => {
    setActiveView(view);
    createScreenReaderAnnouncement(
      `Switched to ${view} view. ${view === 'dashboard' ? 'Showing metrics and charts.' : 'Showing task list.'}`,
      'polite'
    );
  };

  /**
   * Handle tab changes with accessibility announcements
   */
  static handleTabChange = (
    tab: string,
    setActiveTab: (tab: string) => void
  ) => {
    setActiveTab(tab);
    const tabName = tab === 'all' ? 'all tasks' : `${tab} tasks`;
    createScreenReaderAnnouncement(
      `Switched to ${tabName} tab.`,
      'polite'
    );
  };

  /**
   * Handle filter reset with accessibility announcements
   */
  static handleResetAllFilters = (
    resetFilters: () => void,
    resetAdvancedFilters: () => void,
    setActiveTab: (tab: string) => void
  ) => {
    resetFilters();
    resetAdvancedFilters();
    setActiveTab('all');
    
    createScreenReaderAnnouncement(
      'All filters have been reset. Showing all tasks.',
      'polite'
    );
  };

  /**
   * Handle advanced filters toggle with accessibility announcements
   */
  static handleAdvancedFiltersToggle = (
    showAdvancedFilters: boolean,
    setShowAdvancedFilters: (show: boolean) => void
  ) => {
    setShowAdvancedFilters(!showAdvancedFilters);
    createScreenReaderAnnouncement(
      `Switched to ${!showAdvancedFilters ? 'advanced' : 'simple'} filters.`,
      'polite'
    );
  };
}
