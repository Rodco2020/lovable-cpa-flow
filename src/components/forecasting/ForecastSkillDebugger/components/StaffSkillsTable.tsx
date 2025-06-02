
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StaffSkillAnalysis } from '../types';
import { SkillCountUtils } from '../utils/skillCountUtils';

interface StaffSkillsTableProps {
  staffSkills: StaffSkillAnalysis[];
  loading: boolean;
}

const StaffSkillsTable: React.FC<StaffSkillsTableProps> = ({ staffSkills, loading }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Name</TableHead>
            <TableHead>Role Title</TableHead>
            <TableHead>Original Skills</TableHead>
            <TableHead>Mapped Forecast Skills</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffSkills.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.name}</TableCell>
              <TableCell>{staff.roleTitle}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {staff.originalSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {staff.mappedSkills.map((skill: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className={SkillCountUtils.getSkillBadgeColor(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {staff.defaultedToJunior && (
                  <Badge variant="outline" className="bg-orange-100">
                    Defaulted to Junior
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
          {staffSkills.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No staff skills found
              </TableCell>
            </TableRow>
          )}
          {loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                <p className="text-muted-foreground">Loading staff skills...</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffSkillsTable;
