
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DemandMatrixData } from '@/types/demand';

interface DemandMatrixExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[]; // Enhanced: Added staff support
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixExportDialog: React.FC<DemandMatrixExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff, // Enhanced: Include staff in export
  monthRange,
  groupingMode
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Demand Matrix Data</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Export functionality will be implemented here.</p>
          <p>Selected: {selectedSkills.length} skills, {selectedClients.length} clients, {selectedPreferredStaff.length} staff</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
