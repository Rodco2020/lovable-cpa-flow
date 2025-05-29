
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckSquare, Square, Keyboard, MousePointer } from 'lucide-react';
import { UnifiedTask } from '../hooks/useEnhancedTaskSelection';

interface BulkSelectionControlsProps {
  tasks: UnifiedTask[];
  selectedTaskIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleTask: (taskId: string) => void;
  totalCount: number;
  isKeyboardMode?: boolean;
  onToggleKeyboardMode?: () => void;
}

export const BulkSelectionControls: React.FC<BulkSelectionControlsProps> = ({
  tasks,
  selectedTaskIds,
  onSelectAll,
  onDeselectAll,
  onToggleTask,
  totalCount,
  isKeyboardMode = false,
  onToggleKeyboardMode
}) => {
  const selectedCount = selectedTaskIds.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  // Keyboard shortcuts for bulk selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + A to select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        if (isAllSelected) {
          onDeselectAll();
        } else {
          onSelectAll();
        }
      }

      // Ctrl/Cmd + D to deselect all
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        onDeselectAll();
      }

      // Space to toggle keyboard mode
      if (event.key === ' ' && onToggleKeyboardMode) {
        event.preventDefault();
        onToggleKeyboardMode();
      }

      // Arrow keys for keyboard navigation in keyboard mode
      if (isKeyboardMode && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
        // This would be implemented with focus management
        // For now, we'll just show the keyboard mode is active
      }

      // Enter to select focused item in keyboard mode
      if (isKeyboardMode && event.key === 'Enter') {
        event.preventDefault();
        // This would toggle the focused item
        // For now, we'll just indicate the functionality exists
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAllSelected, onSelectAll, onDeselectAll, isKeyboardMode, onToggleKeyboardMode]);

  const getSelectionStatus = () => {
    if (selectedCount === 0) return 'None selected';
    if (isAllSelected) return 'All selected';
    return `${selectedCount} of ${totalCount} selected`;
  };

  const handleCheckboxChange = () => {
    if (isAllSelected || isPartiallySelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
      {/* Selection Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleCheckboxChange}
              aria-label={`${isAllSelected ? 'Deselect all' : 'Select all'} tasks`}
              className={isPartiallySelected ? 'data-[state=checked]:bg-primary/50' : ''}
            />
            <span className="text-sm font-medium">{getSelectionStatus()}</span>
          </div>

          {selectedCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {selectedCount} task{selectedCount !== 1 ? 's' : ''} to copy
            </Badge>
          )}
        </div>

        {/* Keyboard Mode Toggle */}
        {onToggleKeyboardMode && (
          <Button
            variant={isKeyboardMode ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleKeyboardMode}
            className="flex items-center space-x-2"
            aria-label={`${isKeyboardMode ? 'Disable' : 'Enable'} keyboard navigation mode`}
          >
            {isKeyboardMode ? <Keyboard className="h-4 w-4" /> : <MousePointer className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {isKeyboardMode ? 'Keyboard' : 'Mouse'} Mode
            </span>
          </Button>
        )}
      </div>

      <Separator />

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          disabled={isAllSelected || totalCount === 0}
          className="flex items-center space-x-2"
        >
          <CheckSquare className="h-4 w-4" />
          <span>Select All ({totalCount})</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDeselectAll}
          disabled={selectedCount === 0}
          className="flex items-center space-x-2"
        >
          <Square className="h-4 w-4" />
          <span>Deselect All</span>
        </Button>

        {/* Keyboard Shortcuts Help */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-muted-foreground ml-auto">
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">⌘A</kbd>
            <span>Select/Deselect All</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">⌘D</kbd>
            <span>Deselect All</span>
          </div>
          {onToggleKeyboardMode && (
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border">Space</kbd>
              <span>Toggle Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getSelectionStatus()}. {selectedCount > 0 && `${selectedCount} tasks ready to copy.`}
      </div>
    </div>
  );
};
