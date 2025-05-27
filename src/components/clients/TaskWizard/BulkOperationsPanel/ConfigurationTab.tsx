
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BulkOperationConfig } from '../types';

interface ConfigurationTabProps {
  config: BulkOperationConfig;
  onConfigChange: (config: BulkOperationConfig) => void;
}

export const ConfigurationTab: React.FC<ConfigurationTabProps> = ({
  config,
  onConfigChange
}) => {
  const updateConfig = (updates: Partial<BulkOperationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Operation Type</Label>
          <Select
            value={config.operationType}
            onValueChange={(value: any) => updateConfig({ operationType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="template-assignment">Template Assignment</SelectItem>
              <SelectItem value="task-copy">Task Copy</SelectItem>
              <SelectItem value="batch-update">Batch Update</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Batch Size</Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={config.batchSize}
            onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) || 10 })}
          />
        </div>

        <div className="space-y-2">
          <Label>Concurrency</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={config.concurrency}
            onChange={(e) => updateConfig({ concurrency: parseInt(e.target.value) || 3 })}
          />
        </div>
      </div>
    </div>
  );
};
