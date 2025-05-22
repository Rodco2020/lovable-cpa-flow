
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const StaffReport: React.FC = () => {
  const { data: staffData, isLoading } = useQuery({
    queryKey: ["staffReport"],
    queryFn: async () => {
      // This would be replaced with an actual API call
      // For now, returning mock data
      return [
        {
          id: "staff-1",
          fullName: "Jane Smith",
          roleTitle: "Senior Accountant",
          skills: ["Tax Preparation", "Advisory", "Audit"],
          availability: {
            monday: 8,
            tuesday: 8,
            wednesday: 6,
            thursday: 8,
            friday: 4,
            total: 34
          }
        },
        {
          id: "staff-2",
          fullName: "John Doe",
          roleTitle: "Tax Specialist",
          skills: ["Tax Preparation", "Research"],
          availability: {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            total: 40
          }
        }
      ];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Skills & Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Skills & Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Weekly Availability</TableHead>
              <TableHead>Daily Breakdown</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffData?.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.fullName}</TableCell>
                <TableCell>{staff.roleTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {staff.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{staff.availability.total} hours</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <div>Mon: {staff.availability.monday}h</div>
                    <div>Tue: {staff.availability.tuesday}h</div>
                    <div>Wed: {staff.availability.wednesday}h</div>
                    <div>Thu: {staff.availability.thursday}h</div>
                    <div>Fri: {staff.availability.friday}h</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StaffReport;
