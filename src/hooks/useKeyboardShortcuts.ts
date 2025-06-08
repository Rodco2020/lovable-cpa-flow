
import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

/**
 * Keyboard Shortcuts Hook
 * Provides consistent keyboard navigation and shortcuts across the application
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

/**
 * Common keyboard shortcuts for forecasting module
 */
export const useForecastingKeyboardShortcuts = (actions: {
  refreshData?: () => void;
  toggleMatrix?: () => void;
  toggleClientDetails?: () => void;
  exportData?: () => void;
  showHelp?: () => void;
  focusSearch?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'r',
      ctrlKey: true,
      action: actions.refreshData || (() => {}),
      description: 'Refresh data',
      category: 'Data'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: actions.toggleMatrix || (() => {}),
      description: 'Toggle Matrix view',
      category: 'Navigation'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: actions.toggleClientDetails || (() => {}),
      description: 'Toggle Client Details',
      category: 'Navigation'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: actions.exportData || (() => {}),
      description: 'Export data',
      category: 'Actions'
    },
    {
      key: 'h',
      ctrlKey: true,
      action: actions.showHelp || (() => {}),
      description: 'Show help',
      category: 'Help'
    },
    {
      key: '/',
      action: actions.focusSearch || (() => {}),
      description: 'Focus search',
      category: 'Navigation'
    }
  ];

  useKeyboardShortcuts(shortcuts.filter(s => s.action !== (() => {})));

  return shortcuts;
};
