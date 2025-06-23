
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText, Users, Calendar, Filter } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';

interface DemandMatrixPrintExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixPrintExportDialog: React.FC<DemandMatrixPrintExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  groupingMode
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getFilterSummary = () => {
    const isAllSkills = selectedSkills.length === 0 || selectedSkills.length === demandData.skills.length;
    const isAllClients = selectedClients.length === 0;
    const isAllStaff = selectedPreferredStaff.length === 0 || selectedPreferredStaff.length === (demandData.availableStaff?.length || 0);

    return {
      skills: isAllSkills ? 'All Skills' : `${selectedSkills.length} Skills`,
      clients: isAllClients ? 'All Clients' : `${selectedClients.length} Clients`,
      staff: isAllStaff ? 'All Staff' : `${selectedPreferredStaff.length} Staff`,
      timeRange: `${monthNames[monthRange.start]} - ${monthNames[monthRange.end]}`
    };
  };

  const filterSummary = getFilterSummary();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print/Export Reports
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Report Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Report Configuration</span>
            </div>
            
            <div className="space-y-2 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <Badge variant="outline">{groupingMode === 'skill' ? 'Skills' : 'Clients'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skills:</span>
                <Badge variant="secondary">{filterSummary.skills}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Clients:</span>
                <Badge variant="secondary">{filterSummary.clients}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Staff:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {filterSummary.staff}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Period:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {filterSummary.timeRange}
                </Badge>
              </div>
            </div>
          </div>

          {/* Report Options */}
          <div className="space-y-2">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="w-full flex items-center gap-2"
              size="sm"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
            
            <Button 
              onClick={onClose} 
              className="w-full flex items-center gap-2"
              size="sm"
            >
              <FileText className="h-4 w-4" />
              Export PDF Report
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Reports include staff assignments and reflect current filter selections
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
