
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SkillAllocationStrategy } from '@/types/forecasting';

// Stub functions to be implemented later in forecastingService
const getSkillAllocationStrategy = (): SkillAllocationStrategy => 'duplicate';
const setSkillAllocationStrategy = (strategy: SkillAllocationStrategy) => {};

interface SkillAllocationSelectorProps {
  onChange?: (strategy: SkillAllocationStrategy) => void;
}

const SkillAllocationSelector: React.FC<SkillAllocationSelectorProps> = ({ onChange }) => {
  const [strategy, setStrategy] = React.useState<SkillAllocationStrategy>(
    getSkillAllocationStrategy()
  );

  const handleStrategyChange = (value: string) => {
    const newStrategy = value as SkillAllocationStrategy;
    setStrategy(newStrategy);
    setSkillAllocationStrategy(newStrategy);
    
    if (onChange) {
      onChange(newStrategy);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="skill-allocation-strategy">Skill Hour Allocation</Label>
      </div>
      <Select value={strategy} onValueChange={handleStrategyChange}>
        <SelectTrigger id="skill-allocation-strategy" className="w-full">
          <SelectValue placeholder="Select allocation strategy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="duplicate">
            Duplicate Hours (per Skill)
          </SelectItem>
          <SelectItem value="distribute">
            Distribute Hours (across Skills)
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {strategy === 'duplicate' 
          ? "Tasks count their full hours for each required skill" 
          : "Task hours are distributed evenly across all required skills"}
      </p>
    </div>
  );
};

export default SkillAllocationSelector;
