
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { SkillCounts } from '../types';

interface SkillDistributionPanelProps {
  skillCounts: SkillCounts;
}

const SkillDistributionPanel: React.FC<SkillDistributionPanelProps> = ({ skillCounts }) => {
  return (
    <div className="border rounded-md p-3 flex-1 bg-background">
      <p className="text-sm font-medium mb-1">Skill Type Distribution</p>
      <div className="flex gap-2">
        <Badge variant="outline" className="bg-blue-100">
          Junior Staff: {skillCounts['Junior Staff']}
        </Badge>
        <Badge variant="outline" className="bg-purple-100">
          Senior Staff: {skillCounts['Senior Staff']}
        </Badge>
        <Badge variant="outline" className="bg-green-100">
          CPA: {skillCounts['CPA']}
        </Badge>
      </div>
    </div>
  );
};

export default SkillDistributionPanel;
