
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllStaff, calculateAvailabilitySummary } from "@/services/staffService";
import { useSkillNames } from "@/hooks/useSkillNames";
import { Staff, AvailabilitySummary } from "@/types/staff";
import { Skill } from "@/types/skill";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  // Fetch all staff members
  const { data: staffList, isLoading: staffLoading, refetch: refetchStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: getAllStaff,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Get skill information for all skills
  const allSkillIds = staffList?.flatMap(staff => staff.skills) || [];
  const { skillsMap, isLoading: skillsLoading } = useSkillNames(allSkillIds);

  // Load staff data and availability
  useEffect(() => {
    const loadStaffData = async () => {
      if (!staffList || skillsLoading) return;
      
      setIsLoading(true);
      setConnectionError(false);
      
      try {
        const reportItems: StaffReportItem[] = [];
        const connectionErrors: string[] = [];
        
        for (const staff of staffList) {
          // Get availability summary
          let availabilitySummary = null;
          try {
            console.log(`Fetching availability for staff ${staff.id}`);
            availabilitySummary = await calculateAvailabilitySummary(staff.id);
          } catch (err) {
            console.error(`Failed to get availability for ${staff.fullName}:`, err);
            
            // Check if it's a connection error
            if (err instanceof Error && 
               (err.message.includes('Failed to fetch') || 
                err.message.includes('network') || 
                err.message.includes('connection'))) {
              connectionErrors.push(staff.fullName);
            }
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
        
        // If we have connection errors but still got some data
        if (connectionErrors.length > 0) {
          console.warn(`Connection errors for staff: ${connectionErrors.join(', ')}`);
          setConnectionError(true);
          toast({
            title: "Connection Issues",
            description: `Unable to fetch availability data for some staff members. The report will show partial data.`,
            variant: "warning",
          });
        }
      } catch (err) {
        console.error("Failed to load staff report data:", err);
        setError("Failed to load staff data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load staff report data",
          variant: "destructive",
        });
      } finally {
        setIsRetrying(false);
        setIsLoading(false);
      }
    };
    
    loadStaffData();
  }, [staffList, skillsMap, skillsLoading, toast]);

  // Function to retry loading the report
  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    
    try {
      await refetchStaff();
    } catch (err) {
      console.error("Error refetching staff data:", err);
      setError("Failed to refresh staff data.");
      toast({
        title: "Error",
        description: "Failed to reload staff data",
        variant: "destructive",
      });
      setIsRetrying(false);
    }
  };

  // Helper function to format weekly hours
  const formatWeeklyHours = (hours: number): string => {
    return hours % 1 === 0 ? `${hours}` : `${hours.toFixed(1)}`;
  };
  
  // Format skills as comma-separated list
  const formatSkills = (skills: Skill[]): string => {
    return skills.map(skill => skill.name).join(", ");
  };

  if (isLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading staff report...</span>
      </div>
    );
  }

  if (error && !staffList?.length) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
          <p className="mb-4 text-sm">There was a problem connecting to the database. Please try again later.</p>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Skills & Availability Report</CardTitle>
        {connectionError && (
          <CardDescription className="text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Some availability data could not be loaded due to connection issues.
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 h-7 px-2"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          </CardDescription>
        )}
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
            {staffReport.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              staffReport.map((item) => (
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
                      <span className="text-gray-500 italic">Not available</span>
                    )}
                  </TableCell>
                  <TableCell>${item.staff.costPerHour.toFixed(2)}/hr</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StaffReport;
