
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ActionsSectionProps {
  onExport: (options?: any) => void;
}

/**
 * Actions Section Component
 * Handles export and other action buttons
 */
export const ActionsSection: React.FC<ActionsSectionProps> = ({ onExport }) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">Actions</Label>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onExport({})}
        className="w-full justify-start"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Matrix
      </Button>
    </div>
  );
};
