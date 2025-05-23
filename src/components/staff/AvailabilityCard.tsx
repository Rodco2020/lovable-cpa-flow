
import React from "react";
import { Link } from "react-router-dom";
import { AvailabilitySummary } from "@/types/staff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface AvailabilityCardProps {
  staffId: string;
  availabilitySummary: AvailabilitySummary | undefined;
  isLoading: boolean;
}

/**
 * Component that displays the weekly availability overview in a card
 */
const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ 
  staffId, 
  availabilitySummary, 
  isLoading 
}) => {
  // Map day number to day name for display
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Weekly availability overview</CardDescription>
        </div>
        {!isLoading && availabilitySummary && (
          <div className="flex items-center bg-green-50 text-green-800 rounded-full px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-medium">{availabilitySummary.weeklyTotal.toFixed(1)} hrs/week</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading availability...</div>
        ) : availabilitySummary ? (
          <>
            <div className="text-sm text-center mb-4">
              <span className="text-muted-foreground">Average: </span>
              <span className="font-medium">{availabilitySummary.averageDailyHours.toFixed(1)} hrs/day</span>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((day) => {
                const dayData = availabilitySummary.dailySummaries.find(summary => summary.day === day);
                const hasAvailability = dayData && dayData.totalHours > 0;
                
                return (
                  <div key={day} className="text-center">
                    <div className="font-medium text-sm">{dayNames[day]}</div>
                    <div className={`h-8 ${hasAvailability ? 'bg-green-100' : 'bg-gray-100'} rounded-sm mt-1 flex flex-col items-center justify-center`}>
                      {hasAvailability ? (
                        <>
                          <span className="text-xs text-green-700">Available</span>
                          <span className="text-xs font-semibold text-green-800">{dayData.totalHours.toFixed(1)}h</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <Link to={`/staff/${staffId}/availability`} className="text-primary hover:underline text-sm">
                View and edit detailed availability
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-amber-600">
            No availability data found. 
            <Link to={`/staff/${staffId}/availability`} className="text-primary hover:underline block mt-2">
              Set up availability
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCard;
