
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditTaskFormValues } from '../types';

interface DiagnosticPanelProps {
  form: UseFormReturn<EditTaskFormValues>;
  isVisible: boolean;
}

/**
 * PHASE 1: Diagnostic Panel for real-time form value monitoring
 * This component will be removed after the debugging phase
 */
export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ form, isVisible }) => {
  const watchedValues = form.watch();
  
  if (!isVisible) return null;

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
          🔍 Phase 1: Diagnostic Panel
          <Badge variant="outline" className="text-xs">Debug Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong className="text-orange-700">Preferred Staff ID:</strong>
            <div className="font-mono bg-white p-1 rounded border">
              Value: {JSON.stringify(watchedValues.preferredStaffId)}
            </div>
            <div className="font-mono bg-white p-1 rounded border mt-1">
              Type: {typeof watchedValues.preferredStaffId}
            </div>
            <div className="font-mono bg-white p-1 rounded border mt-1">
              Is Null: {watchedValues.preferredStaffId === null ? 'YES' : 'NO'}
            </div>
            <div className="font-mono bg-white p-1 rounded border mt-1">
              Is Undefined: {watchedValues.preferredStaffId === undefined ? 'YES' : 'NO'}
            </div>
          </div>
          
          <div>
            <strong className="text-orange-700">Form State:</strong>
            <div className="font-mono bg-white p-1 rounded border text-xs max-h-32 overflow-auto">
              {JSON.stringify(watchedValues, null, 2)}
            </div>
          </div>
        </div>
        
        <div className="text-orange-600 text-xs mt-2">
          ⚠️ This diagnostic panel is for Phase 1 debugging only and will be removed after issue resolution.
        </div>
      </CardContent>
    </Card>
  );
};
