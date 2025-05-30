
/**
 * Accessibility Utilities
 * 
 * Provides consistent accessibility features across all components
 * Ensures WCAG compliance and better user experience for all users
 */

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  role?: string;
  tabIndex?: number;
}

/**
 * Generate accessible props for metric cards
 */
export const getMetricCardAccessibility = (
  title: string,
  value: string | number,
  description?: string
): AccessibilityProps => ({
  'aria-label': `${title}: ${value}${description ? `, ${description}` : ''}`,
  role: 'region',
  tabIndex: 0
});

/**
 * Generate accessible props for charts
 */
export const getChartAccessibility = (
  chartType: string,
  dataDescription: string
): AccessibilityProps => ({
  'aria-label': `${chartType} chart showing ${dataDescription}`,
  role: 'img',
  tabIndex: 0
});

/**
 * Generate accessible props for filter controls
 */
export const getFilterAccessibility = (
  filterName: string,
  currentValue?: string,
  totalOptions?: number
): AccessibilityProps => ({
  'aria-label': `Filter by ${filterName}${currentValue ? `, currently ${currentValue}` : ''}${
    totalOptions ? `, ${totalOptions} options available` : ''
  }`,
  role: 'combobox',
  'aria-expanded': false
});

/**
 * Generate accessible props for loading states
 */
export const getLoadingAccessibility = (context: string): AccessibilityProps => ({
  'aria-label': `Loading ${context}`,
  'aria-live': 'polite',
  role: 'status'
});

/**
 * Generate accessible props for error states
 */
export const getErrorAccessibility = (errorMessage: string): AccessibilityProps => ({
  'aria-label': `Error: ${errorMessage}`,
  'aria-live': 'assertive',
  role: 'alert'
});

/**
 * Generate accessible props for tables
 */
export const getTableAccessibility = (
  caption: string,
  rowCount: number,
  columnCount: number
): AccessibilityProps => ({
  'aria-label': `${caption}. Table with ${rowCount} rows and ${columnCount} columns`,
  role: 'table'
});

/**
 * Generate accessible props for buttons with icons
 */
export const getIconButtonAccessibility = (
  action: string,
  description?: string
): AccessibilityProps => ({
  'aria-label': `${action}${description ? `: ${description}` : ''}`,
  role: 'button'
});

/**
 * Generate accessible props for navigation elements
 */
export const getNavigationAccessibility = (
  currentPage: string,
  totalPages?: number
): AccessibilityProps => ({
  'aria-label': `Navigation${totalPages ? `, page ${currentPage} of ${totalPages}` : ''}`,
  'aria-current': 'page',
  role: 'navigation'
});

/**
 * Generate screen reader announcements for dynamic content
 */
export const createScreenReaderAnnouncement = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Trap focus within a container
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
  
  /**
   * Return focus to a previously focused element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (element && element.focus) {
      element.focus();
    }
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onIndexChange(Math.min(currentIndex + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        onIndexChange(Math.max(currentIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        break;
      case 'End':
        event.preventDefault();
        onIndexChange(items.length - 1);
        break;
    }
  }
};
