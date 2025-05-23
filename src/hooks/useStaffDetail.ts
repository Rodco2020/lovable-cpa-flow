
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getStaffById, calculateAvailabilitySummary } from "@/services/staff";
import { Staff, AvailabilitySummary } from "@/types/staff";
import { toast } from "sonner";

/**
 * Custom hook to manage staff detail data loading and state
 * Centralizes the data fetching and error handling logic
 */
export const useStaffDetail = (id: string | undefined) => {
  const navigate = useNavigate();

  const { 
    data: staff, 
    isLoading: staffLoading, 
    error: staffError 
  } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching staff details:", error);
        toast.error("Failed to load staff details");
      }
    }
  });

  const { 
    data: availabilitySummary, 
    isLoading: summaryLoading 
  } = useQuery<AvailabilitySummary>({
    queryKey: ["availability-summary", id],
    queryFn: () => calculateAvailabilitySummary(id || ""),
    enabled: !!id && !!staff,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching availability summary:", error);
        // Don't show error toast here as this is not critical
      }
    }
  });

  return {
    staff,
    staffLoading,
    staffError,
    availabilitySummary,
    summaryLoading,
    navigate
  };
};
