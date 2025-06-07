
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Filter, Eye } from 'lucide-react';
import { MatrixControlsCore } from './MatrixControlsCore';
import { ClientFilterSection } from './ClientFilterSection';
import { ClientFilterDebugger } from './ClientFilterDebugger';
import { useMatrixControls } from '../hooks/useMatrixControls';

interface MatrixControlsPanelProps {
  // Matrix controls props
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  forecastMode: 'virtual' | 'actual';
  onForecastModeChange: (mode: 'virtual' | 'actual') => void;
  startMonth: Date;
  onStartMonthChange: (date: Date) => void;
  onExport: (options?: any) => void;
  onPrint: () => void;
  isExporting: boolean;
  
  // Client filter props
  selectedClientIds: string[];
  onClientSelectionChange: (clientIds: string[]) => void;
}

export const MatrixControlsPanel: React.FC<MatrixControlsPanelProps> = ({
  selectedSkills,
  onSkillsChange,
  forecastMode,
  onForecastModeChange,
  startMonth,
  onStartMonthChange,
  onExport,
  onPrint,
  isExporting,
  selectedClientIds,
  onClientSelectionChange
}) => {
  const {
    isClientFilterCollapsed,
    toggleClientFilter,
    isDebugMode
  } = useMatrixControls();

  return (
    <div className="space-y-4">
      {/* Debug section - visible during Phase 1 testing */}
      {isDebugMode && (
        <ClientFilterDebugger />
      )}

      {/* Matrix Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Matrix Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MatrixControlsCore
            selectedSkills={selectedSkills}
            onSkillsChange={onSkillsChange}
            forecastMode={forecastMode}
            onForecastModeChange={onForecastModeChange}
            startMonth={startMonth}
            onStartMonthChange={onStartMonthChange}
            onExport={onExport}
            onPrint={onPrint}
            isExporting={isExporting}
          />
        </CardContent>
      </Card>

      {/* Client Filter */}
      <ClientFilterSection
        selectedClientIds={selectedClientIds}
        onClientSelectionChange={onClientSelectionChange}
        isCollapsed={isClientFilterCollapsed}
        onToggleCollapse={toggleClientFilter}
      />

      {/* View Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Additional view controls will be added here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
