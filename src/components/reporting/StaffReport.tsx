
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllStaff, calculateAvailabilitySummary } from "@/services/staffService";
import { useSkillNames } from "@/hooks/useSkillNames";
import { Staff, AvailabilitySummary } from "@/types/staff";
import { Skill } from "@/types/skill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CustomBadge } from "@/components/ui/custom-badge";

interface StaffReportItem {
  staff: Staff;
  skills: Skill[];
  availability: AvailabilitySummary | null;
}

const StaffReport: React.FC = () => {
  const { toast } = useToast();
  const [staffReport, setStaffReport] = useState<StaffReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all staff members
  const { data: staffList } = useQuery({
    queryKey: ["staff"],
    queryFn: getAllStaff,
  });

  // Get skill information for all skills
  const allSkillIds = staffList?.flatMap(staff => staff.skills) || [];
  const { skillsMap, isLoading: skillsLoading } = useSkillNames(allSkillIds);

  // Load staff data and availability
  useEffect(() => {
    const loadStaffData = async () => {
      if (!staffList || skillsLoading) return;
      
      setIsLoading(true);
      try {
        const reportItems: StaffReportItem[] = [];
        
        for (const staff of staffList) {
          // Get availability summary
          let availabilitySummary = null;
          try {
            availabilitySummary = await calculateAvailabilitySummary(staff.id);
          } catch (err) {
            console.error(`Failed to get availability for ${staff.fullName}:`, err);
          }
          
          // Map skill IDs to skill objects
          const staffSkills = staff.skills.map(skillId => 
            skillsMap[skillId] || { 
              id: skillId, 
              name: "Unknown Skill", 
              description: "Skill information not available" 
            }
          );
          
          reportItems.push({
            staff,
            skills: staffSkills,
            availability: availabilitySummary
          });
        }
        
        setStaffReport(reportItems);
      } catch (err) {
        console.error("Failed to load staff report data:", err);
        setError("Failed to load staff data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load staff report data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStaffData();
  }, [staffList, skillsMap, skillsLoading, toast]);

  // Helper function to format weekly hours
  const formatWeeklyHours = (hours: number): string => {
    return hours % 1 === 0 ? `${hours}` : `${hours.toFixed(1)}`;
  };
  
  // Format skills as comma-separated list
  const formatSkills = (skills: Skill[]): string => {
    return skills.map(skill => skill.name).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading staff report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Skills & Availability Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Weekly Hours</TableHead>
              <TableHead>Cost/Hour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffReport.map((item) => (
              <TableRow key={item.staff.id}>
                <TableCell className="font-medium">{item.staff.fullName}</TableCell>
                <TableCell>
                  <CustomBadge 
                    variant={item.staff.status === "active" ? "success" : "destructive"} 
                    className="capitalize"
                  >
                    {item.staff.status}
                  </CustomBadge>
                </TableCell>
                <TableCell>{formatSkills(item.skills)}</TableCell>
                <TableCell>
                  {item.availability ? (
                    <span className={`${item.availability.weeklyTotal < 20 ? 'text-amber-600' : 'text-green-600'} font-medium`}>
                      {formatWeeklyHours(item.availability.weeklyTotal)} hours/week
                    </span>
                  ) : (
                    <span className="text-red-500 italic">Not set</span>
                  )}
                </TableCell>
                <TableCell>${item.staff.costPerHour.toFixed(2)}/hr</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StaffReport;
