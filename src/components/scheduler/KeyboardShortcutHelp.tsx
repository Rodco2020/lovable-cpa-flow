
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, HelpCircle } from "lucide-react";

interface ShortcutItem {
  key: string;
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { key: "R", description: "Refresh all data" },
  { key: "→", description: "Navigate to next day" },
  { key: "←", description: "Navigate to previous day" },
  { key: "1", description: "Switch to Manual mode" },
  { key: "2", description: "Switch to Hybrid mode" },
  { key: "3", description: "Switch to Automatic mode" },
  { key: "?", description: "Show this help dialog" },
];

interface KeyboardShortcutHelpProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline-block">Keyboard Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Keyboard className="mr-2 h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts for faster navigation and scheduling
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <kbd className="inline-flex h-6 items-center gap-1 rounded border bg-slate-50 px-2 text-xs">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-blue-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HelpCircle
                  className="h-5 w-5 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Keyboard shortcuts work when no input is focused</li>
                    <li>
                      Use Tab and Shift+Tab to navigate between interactive
                      elements
                    </li>
                    <li>
                      Press Enter or Space to interact with selected elements
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutHelp;
