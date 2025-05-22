
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { StaffTaskRecommendation } from '@/services/schedulerService';
import { scheduleTask } from '@/services/schedulerService';

interface RecommendationPanelProps {
  recommendations: StaffTaskRecommendation[];
  onRecommendationApplied: () => void;
  onClose: () => void;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  onRecommendationApplied,
  onClose
}) => {
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  if (recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>No recommendations available for this task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleApplyRecommendation = async (recommendation: StaffTaskRecommendation) => {
    try {
      setIsApplying(true);
      setSelectedRecommendation(recommendation.taskId + recommendation.staffId);
      
      await scheduleTask(
        recommendation.taskId,
        recommendation.staffId,
        recommendation.date,
        recommendation.startTime,
        recommendation.endTime
      );
      
      toast({
        title: "Task Scheduled",
        description: `"${recommendation.taskName}" has been scheduled with ${recommendation.staffName}`,
      });
      
      onRecommendationApplied();
    } catch (error) {
      console.error("Error applying recommendation:", error);
      toast({
        title: "Error",
        description: "Could not apply the recommendation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
      setSelectedRecommendation(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recommended Assignments</CardTitle>
        <CardDescription>
          Based on skills, availability, and task urgency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {recommendations.map((recommendation, index) => (
            <div 
              key={`${recommendation.taskId}_${recommendation.staffId}_${index}`}
              className={`border rounded-lg p-4 transition-colors ${
                selectedRecommendation === recommendation.taskId + recommendation.staffId
                  ? "bg-slate-50 border-blue-400"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{recommendation.taskName}</h4>
                    <p className="text-sm text-muted-foreground">Assigned to: {recommendation.staffName}</p>
                  </div>
                  <Badge variant={recommendation.matchScore > 80 ? "default" : "outline"}>
                    {recommendation.matchScore}% Match
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" /> 
                  <span>{recommendation.date} @ {recommendation.startTime} - {recommendation.endTime}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {recommendation.skillMatch ? (
                    <div className="flex items-center text-xs text-green-600 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Skill match
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-amber-600 gap-1">
                      <AlertCircle className="h-3 w-3" /> Partial skill match
                    </div>
                  )}
                  
                  {recommendation.requiredSkills.map(skill => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-1"
                    disabled={isApplying && selectedRecommendation === recommendation.taskId + recommendation.staffId}
                    onClick={() => handleApplyRecommendation(recommendation)}
                  >
                    Apply <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {recommendations.length} recommendations found
          </p>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationPanel;
