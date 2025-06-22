
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DemandMatrixData } from '@/types/demand';

interface DemandMatrixPrintExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[]; // Enhanced: Added staff support
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixPrintExportDialog: React.FC<DemandMatrixPrintExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff, // Enhanced: Include staff in print export
  monthRange,
  groupingMode
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Print/Export Reports</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Print/Export functionality will be implemented here.</p>
          <p>Selected: {selectedSkills.length} skills, {selectedClients.length} clients, {selectedPreferredStaff.length} staff</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
