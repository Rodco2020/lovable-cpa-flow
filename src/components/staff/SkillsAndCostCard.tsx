
import React from "react";
import { Staff } from "@/types/staff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { useSkillNames } from "@/hooks/useSkillNames";

interface SkillsAndCostCardProps {
  staff: Staff;
}

/**
 * Component that displays the skills and cost information in a card
 */
const SkillsAndCostCard: React.FC<SkillsAndCostCardProps> = ({ staff }) => {
  const { skillsMap, isLoading: skillsLoading } = useSkillNames(staff.skills || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Cost</CardTitle>
        <CardDescription>Assigned skills and billing rate</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Cost per Hour</dt>
            <dd className="text-lg font-semibold">${staff.costPerHour.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-2">Skills</dt>
            <dd>
              <div className="flex flex-wrap gap-2">
                {skillsLoading ? (
                  <span className="text-sm text-muted-foreground">Loading skills...</span>
                ) : staff.skills.length > 0 ? (
                  staff.skills.map((skillId) => (
                    <CustomBadge key={skillId} variant="outline" className="bg-slate-100">
                      {skillsMap[skillId]?.name || skillId}
                    </CustomBadge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No skills assigned</span>
                )}
              </div>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default SkillsAndCostCard;
