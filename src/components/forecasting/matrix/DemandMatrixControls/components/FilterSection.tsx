
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { FilterSectionProps } from '../types';

/**
 * Reusable filter section wrapper component
 * Provides consistent layout and loading states
 */
export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  badge,
  loading = false,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {badge}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading {title.toLowerCase()}...
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
