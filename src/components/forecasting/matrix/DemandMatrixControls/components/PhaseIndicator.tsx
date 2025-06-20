
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

/**
 * Phase indicator component
 * Shows the current phase status (preserves existing Phase 3 indicator)
 */
export const PhaseIndicator: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <CheckCircle className="h-5 w-5" />
          Phase 3: Enhanced UI with Visual Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-blue-700">
          <div className="p-2 bg-blue-100 rounded text-xs">
            ✅ <strong>Phase 3 Active:</strong> Enhanced preferred staff filter with distinct visual modes and accessibility improvements
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
