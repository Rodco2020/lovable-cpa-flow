
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setSkillAllocationStrategy, getSkillAllocationStrategy } from '@/services/forecastingService';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SkillAllocationSelector: React.FC = () => {
  const [strategy, setStrategy] = React.useState(getSkillAllocationStrategy());
  
  const handleStrategyChange = (newStrategy: string) => {
    setSkillAllocationStrategy(newStrategy as 'distribute' | 'duplicate');
    setStrategy(newStrategy as 'distribute' | 'duplicate');
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Skill Hours:</span>
      <Select value={strategy} onValueChange={handleStrategyChange}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Select strategy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="distribute">
            <div className="flex items-center">
              <span>Distribute</span>
              <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
            </div>
          </SelectItem>
          <SelectItem value="duplicate">
            <div className="flex items-center">
              <span>Duplicate</span>
              <Badge variant="secondary" className="ml-2 text-xs">Inflated</Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle size={16} className="text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p className="font-medium">Skill Allocation Strategy:</p>
            <ul className="list-disc pl-4 mt-1 text-sm">
              <li><b>Distribute:</b> Divide hours equally among required skills (accurate capacity planning)</li>
              <li><b>Duplicate:</b> Count full hours for each required skill (shows inflated totals)</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SkillAllocationSelector;
