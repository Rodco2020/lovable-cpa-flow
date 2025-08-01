
import { useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface KeyboardShortcutOptions {
  onRefresh?: () => void;
  onNextDay?: () => void;
  onPrevDay?: () => void;
  onToggleMode?: (mode: 'manual' | 'hybrid' | 'automatic') => void;
  onShowHelp?: () => void;
  enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for the Scheduler Module
 * 
 * Keyboard shortcuts:
 * - R: Refresh data
 * - Right Arrow: Next day
 * - Left Arrow: Previous day
 * - 1: Switch to manual mode
 * - 2: Switch to hybrid mode
 * - 3: Switch to automatic mode
 * - ?: Show keyboard shortcuts help
 */
export function useSchedulerKeyboardShortcuts({
  onRefresh,
  onNextDay,
  onPrevDay,
  onToggleMode,
  onShowHelp,
  enabled = true
}: KeyboardShortcutOptions) {
  // Show help overlay with keyboard shortcuts
  const showHelpOverlay = useCallback(() => {
    if (onShowHelp) {
      onShowHelp();
      return;
    }
    
    toast({
      title: 'Keyboard Shortcuts',
      description: "R: Refresh data\n→: Next day\n←: Previous day\n1: Manual mode\n2: Hybrid mode\n3: Automatic mode\n?: Show this help",
      duration: 10000,
    });
  }, [onShowHelp]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if focus is in input, textarea, or select
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (event.key) {
      case 'r':
        if (onRefresh) {
          event.preventDefault();
          onRefresh();
          toast({ description: 'Refreshing data...' });
        }
        break;
      case 'ArrowRight':
        if (onNextDay) {
          event.preventDefault();
          onNextDay();
        }
        break;
      case 'ArrowLeft':
        if (onPrevDay) {
          event.preventDefault();
          onPrevDay();
        }
        break;
      case '1':
        if (onToggleMode) {
          event.preventDefault();
          onToggleMode('manual');
          toast({ description: 'Switched to Manual mode' });
        }
        break;
      case '2':
        if (onToggleMode) {
          event.preventDefault();
          onToggleMode('hybrid');
          toast({ description: 'Switched to Hybrid mode' });
        }
        break;
      case '3':
        if (onToggleMode) {
          event.preventDefault();
          onToggleMode('automatic');
          toast({ description: 'Switched to Automatic mode' });
        }
        break;
      case '?':
        event.preventDefault();
        showHelpOverlay();
        break;
      default:
        break;
    }
  }, [onRefresh, onNextDay, onPrevDay, onToggleMode, showHelpOverlay]);

  // Set up event listener
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
  
  return { showHelpOverlay };
}
