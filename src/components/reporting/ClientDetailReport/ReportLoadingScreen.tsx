
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";

interface ReportLoadingScreenProps {
  loadingMessage?: string;
  progress?: number;
}

export const ReportLoadingScreen: React.FC<ReportLoadingScreenProps> = ({
  loadingMessage = "Loading report data...",
  progress
}) => {
  return (
    <div className="space-y-6" role="status" aria-label="Loading report">
      {/* Loading Header */}
      <div className="flex items-center justify-center space-x-3 py-8">
        <Loader 
          className="h-8 w-8 animate-spin text-primary" 
          aria-hidden="true"
        />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{loadingMessage}</h2>
          {progress !== undefined && (
            <div className="w-64 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Skeleton Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        {loadingMessage}
      </div>
    </div>
  );
};
