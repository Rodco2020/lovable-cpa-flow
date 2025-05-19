
import React from 'react';
import { ForecastData, SkillType } from '@/types/forecasting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GapAnalysisTableProps {
  data: ForecastData[];
  skills: SkillType[] | 'all';
}

const GapAnalysisTable: React.FC<GapAnalysisTableProps> = ({ data, skills }) => {
  // Get all unique skills from the data
  const uniqueSkills = new Set<SkillType>();
  data.forEach(period => {
    period.demand.forEach(skillHours => uniqueSkills.add(skillHours.skill));
    period.capacity.forEach(skillHours => uniqueSkills.add(skillHours.skill));
  });
  
  // Filter skills if needed
  const skillsToDisplay = skills === 'all' 
    ? Array.from(uniqueSkills)
    : skills.filter(skill => uniqueSkills.has(skill));
  
  // Calculate skill totals across all periods
  const skillTotals = {} as Record<SkillType, { 
    demand: number; 
    capacity: number; 
    gap: number;
    staffCount?: number;
  }>;
  
  skillsToDisplay.forEach(skill => {
    skillTotals[skill] = { 
      demand: 0, 
      capacity: 0, 
      gap: 0,
      staffCount: 0
    };
    
    data.forEach(period => {
      // Add demand
      const demandItem = period.demand.find(item => item.skill === skill);
      if (demandItem) {
        skillTotals[skill].demand += demandItem.hours;
      }
      
      // Add capacity
      const capacityItem = period.capacity.find(item => item.skill === skill);
      if (capacityItem) {
        skillTotals[skill].capacity += capacityItem.hours;
        // Add staff count from metadata if available
        if (capacityItem.metadata?.staffCount) {
          skillTotals[skill].staffCount = (skillTotals[skill].staffCount || 0) + capacityItem.metadata.staffCount;
        }
      }
    });
    
    // Calculate gap
    skillTotals[skill].gap = skillTotals[skill].capacity - skillTotals[skill].demand;
  });

  // Debug log the totals
  console.log('[Gap Analysis] Skill totals calculated:', skillTotals);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center text-sm text-muted-foreground">
        <HelpCircle className="h-4 w-4 mr-1" />
        <span>This analysis shows the balance between demand (required work hours) and capacity (available staff hours).</span>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Skill</TableHead>
            <TableHead className="text-right">Total Demand (hrs)</TableHead>
            <TableHead className="text-right">Total Capacity (hrs)</TableHead>
            <TableHead className="text-right">Gap (hrs)</TableHead>
            <TableHead className="text-right">Utilization %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skillsToDisplay.map(skill => {
            const total = skillTotals[skill];
            const utilization = total.capacity > 0 
              ? ((total.demand / total.capacity) * 100).toFixed(1)
              : '0.0';
            
            // Determine if this skill has zero capacity (which is a problem)
            const isZeroCapacity = total.capacity === 0;
            
            return (
              <TableRow key={skill}>
                <TableCell className="font-medium">{skill}</TableCell>
                <TableCell className="text-right">
                  {Math.round(total.demand * 10) / 10}
                </TableCell>
                <TableCell className="text-right">
                  {isZeroCapacity ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center text-red-600">
                            {Math.round(total.capacity * 10) / 10}
                            <AlertTriangle className="h-4 w-4 ml-1" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4">
                          <p className="font-semibold mb-1">Zero Capacity Detected!</p>
                          <p>
                            This usually happens because:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 mt-1">
                            <li>Staff with this skill don't have availability templates</li>
                            <li>No active staff have this skill assigned</li>
                            <li>Staff skills don't match forecast skill types</li>
                            <li>Generic "Staff" role doesn't map to this skill type</li>
                          </ul>
                          <p className="mt-2">
                            Try using the "Ensure All Availability Templates" button in the Staff List and check skill mappings.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center">
                            {Math.round(total.capacity * 10) / 10}
                            <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Based on {total.staffCount || '?'} staff member(s) with this skill.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className={`text-right ${total.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(Math.abs(total.gap) * 10) / 10} 
                  {total.gap >= 0 ? ' surplus' : ' shortage'}
                </TableCell>
                <TableCell className={`text-right ${
                  parseFloat(utilization) > 100 
                    ? 'text-red-600' 
                    : parseFloat(utilization) > 85 
                      ? 'text-orange-500' 
                      : 'text-green-600'
                }`}>
                  {utilization}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {skillsToDisplay.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No skill data available. Try changing the forecast parameters.
        </div>
      )}
    </div>
  );
};

export default GapAnalysisTable;
