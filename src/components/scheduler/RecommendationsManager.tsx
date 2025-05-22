
import React from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { StaffTaskRecommendation, generateBatchRecommendations } from '@/services/schedulerService';
import { TaskInstance } from '@/types/task';

interface RecommendationsManagerProps {
  selectedTask: TaskInstance | null;
  setRecommendations: (recommendations: Record<string, StaffTaskRecommendation[]>) => void;
  setSelectedTaskRecommendations: (recommendations: StaffTaskRecommendation[]) => void;
  setShowRecommendations: (show: boolean) => void;
  setSelectedTask: (task: TaskInstance | null) => void;
  setActiveTab: (tab: string) => void;
}

/**
 * Component for managing task scheduling recommendations
 */
export const useRecommendationsManager = () => {
  const [recommendations, setRecommendations] = React.useState<Record<string, StaffTaskRecommendation[]>>({});
  const [showRecommendations, setShowRecommendations] = React.useState<boolean>(false);
  const [selectedTaskRecommendations, setSelectedTaskRecommendations] = React.useState<StaffTaskRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = React.useState(false);
  
  const generateRecommendations = async () => {
    try {
      setIsGeneratingRecommendations(true);
      
      // Get today's date formatted as YYYY-MM-DD
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Generate batch recommendations
      const newRecommendations = await generateBatchRecommendations(today, 10);
      
      // Update recommendations state
      setRecommendations(newRecommendations);
      
      // Show toast message with count of recommendations
      const taskCount = Object.keys(newRecommendations).length;
      if (taskCount > 0) {
        toast({
          title: "Recommendations Generated",
          description: `Found optimal matches for ${taskCount} tasks.`,
        });
      } else {
        toast({
          title: "No Recommendations",
          description: "Could not find suitable matches for any tasks.",
          variant: "destructive",
        });
      }
      
      return newRecommendations;
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate scheduling recommendations.",
        variant: "destructive",
      });
      return {};
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };
  
  const handleRecommendationApplied = (selectedTask: TaskInstance | null) => {
    // Close the recommendations panel
    setShowRecommendations(false);
    
    // Remove this task's recommendations from the list
    if (selectedTask) {
      const updatedRecommendations = { ...recommendations };
      delete updatedRecommendations[selectedTask.id];
      setRecommendations(updatedRecommendations);
    }
    
    // Show toast notification
    toast({
      title: "Task Scheduled",
      description: "The task has been successfully scheduled",
    });
  };
  
  return {
    recommendations,
    setRecommendations,
    showRecommendations,
    setShowRecommendations,
    selectedTaskRecommendations,
    setSelectedTaskRecommendations,
    isGeneratingRecommendations,
    generateRecommendations,
    handleRecommendationApplied
  };
};
