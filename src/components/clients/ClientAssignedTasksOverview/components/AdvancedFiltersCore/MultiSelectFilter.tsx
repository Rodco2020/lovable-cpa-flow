
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface MultiSelectFilterProps {
  title: string;
  selectedValues: string[];
  availableOptions: Array<{ value: string; label: string }>;
  placeholder: string;
  onValueAdd: (value: string) => void;
  onValueRemove: (value: string) => void;
  showCount?: boolean;
}

/**
 * Multi Select Filter Component
 * Reusable component for multi-select filtering
 */
export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  selectedValues,
  availableOptions,
  placeholder,
  onValueAdd,
  onValueRemove,
  showCount = false
}) => {
  const availableForSelection = availableOptions.filter(
    option => !selectedValues.includes(option.value)
  );

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">
        {title}
        {showCount && (
          <Badge variant="outline" className="ml-2 text-xs">
            {availableOptions.length} available
          </Badge>
        )}
      </h4>
      <Select onValueChange={onValueAdd}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableForSelection.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedValues.map(value => {
          const option = availableOptions.find(opt => opt.value === value);
          return (
            <Badge key={value} variant="secondary" className="text-xs">
              {option?.label || 'Unknown'}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => onValueRemove(value)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
