
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ExportOptions } from '@/services/export/exportService';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ExportOptions) => void;
  dataType: 'clients' | 'tasks';
  selectedFormat: 'pdf' | 'excel' | 'csv';
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dataType,
  selectedFormat
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [includeFilters, setIncludeFilters] = useState(true);

  const handleConfirm = () => {
    const options: ExportOptions = {
      format: selectedFormat,
      includeFilters,
      customTitle: customTitle.trim() || undefined
    };
    
    onConfirm(options);
  };

  const defaultTitle = dataType === 'clients' ? 'Client Directory Export' : 'Client-Assigned Tasks Export';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Export Options - {selectedFormat.toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Customize your export settings before generating the file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Custom Title</Label>
            <Input
              id="title"
              placeholder={defaultTitle}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default title
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeFilters"
              checked={includeFilters}
              onCheckedChange={(checked) => setIncludeFilters(!!checked)}
            />
            <Label htmlFor="includeFilters" className="text-sm">
              Include applied filters in export
            </Label>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>Export will include:</strong>
            <ul className="mt-1 space-y-1">
              {dataType === 'clients' ? (
                <>
                  <li>• Client name, contact, and basic information</li>
                  <li>• Industry and status details</li>
                  <li>• Expected monthly revenue</li>
                  <li>• Staff liaison assignments</li>
                </>
              ) : (
                <>
                  <li>• Task names and client assignments</li>
                  <li>• Task types (recurring/ad-hoc) and status</li>
                  <li>• Priority levels and estimated hours</li>
                  <li>• Required skills and due dates</li>
                </>
              )}
              {includeFilters && <li>• Currently applied filter settings</li>}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Export {selectedFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
