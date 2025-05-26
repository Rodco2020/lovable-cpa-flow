import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { TaskTemplate } from '@/types/task';
import { assignTemplatesToClients, getAvailableTemplates } from '@/services/templateAssignmentService';
import { AssignmentConfig } from '../../TaskWizard/AssignmentConfiguration';
import { toast } from '@/hooks/use-toast';

interface OperationProgress {
  completed: number;
  total: number;
  currentOperation?: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}

interface OperationResults {
  tasksCreated: number;
  errors: string[];
  success: boolean;
}

export const useTemplateAssignment = () => {
  // Template selection state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  
  // Client selection state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  
  // Configuration state
  const [assignmentConfig, setAssignmentConfig] = useState<AssignmentConfig>({
    assignmentType: 'ad-hoc',
    customizePerClient: false
  });
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OperationProgress>({
    completed: 0,
    total: 0,
    percentage: 0
  });
  const [operationResults, setOperationResults] = useState<OperationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available templates
  const { 
    data: availableTemplates = [], 
    isLoading: isTemplatesLoading 
  } = useQuery({
    queryKey: ['available-templates'],
    queryFn: getAvailableTemplates
  });

  // Fetch available clients
  const { 
    data: availableClients = [], 
    isLoading: isClientsLoading 
  } = useQuery({
    queryKey: ['available-clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'Active')
        .order('legal_name');

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients.",
          variant: "destructive",
        });
        return [];
      }

      return data.map(client => {
        // Parse notification preferences safely
        let notificationPreferences = {
          emailReminders: true,
          taskNotifications: true
        };

        if (client.notification_preferences) {
          try {
            if (typeof client.notification_preferences === 'string') {
              notificationPreferences = JSON.parse(client.notification_preferences);
            } else if (typeof client.notification_preferences === 'object') {
              notificationPreferences = client.notification_preferences as any;
            }
          } catch (e) {
            console.warn('Failed to parse notification preferences for client:', client.id, e);
            // Keep default values
          }
        }

        return {
          id: client.id,
          legalName: client.legal_name,
          primaryContact: client.primary_contact,
          email: client.email,
          phone: client.phone,
          billingAddress: client.billing_address,
          industry: client.industry as IndustryType,
          status: client.status as 'Active' | 'Inactive',
          paymentTerms: client.payment_terms as PaymentTerms,
          billingFrequency: client.billing_frequency as BillingFrequency,
          expectedMonthlyRevenue: client.expected_monthly_revenue,
          defaultTaskPriority: client.default_task_priority,
          staffLiaisonId: client.staff_liaison_id,
          notificationPreferences,
          createdAt: new Date(client.created_at),
          updatedAt: new Date(client.updated_at)
        };
      });
    }
  });

  const validateSelection = (): string[] => {
    const errors: string[] = [];
    
    if (selectedTemplateIds.length === 0) {
      errors.push('Please select at least one template');
    }
    
    if (selectedClientIds.length === 0) {
      errors.push('Please select at least one client');
    }
    
    if (selectedTemplateIds.length > 10) {
      errors.push('Maximum 10 templates can be selected at once');
    }
    
    if (selectedClientIds.length > 50) {
      errors.push('Maximum 50 clients can be selected at once');
    }
    
    return errors;
  };

  const executeAssignment = async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      setOperationResults(null);

      const totalOperations = selectedTemplateIds.length * selectedClientIds.length;
      let completedOperations = 0;
      const results: OperationResults = {
        tasksCreated: 0,
        errors: [],
        success: true
      };

      const startTime = Date.now();

      // Initialize progress
      setProgress({
        completed: 0,
        total: totalOperations,
        percentage: 0,
        currentOperation: 'Starting assignment...'
      });

      // Process each template
      for (const templateId of selectedTemplateIds) {
        const template = availableTemplates.find(t => t.id === templateId);
        
        setProgress(prev => ({
          ...prev,
          currentOperation: `Assigning template: ${template?.name || templateId}...`
        }));

        try {
          const result = await assignTemplatesToClients({
            templateId,
            clientIds: selectedClientIds,
            config: assignmentConfig
          });

          results.tasksCreated += result.tasksCreated;
          results.errors.push(...result.errors);

          completedOperations += selectedClientIds.length;
          
          setProgress(prev => ({
            ...prev,
            completed: completedOperations,
            percentage: (completedOperations / totalOperations) * 100,
            estimatedTimeRemaining: totalOperations > completedOperations ? 
              ((Date.now() - startTime) / completedOperations) * (totalOperations - completedOperations) / 1000 : 0
          }));

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error assigning template ${templateId}:`, error);
          results.errors.push(`Failed to assign template ${template?.name || templateId}: ${error}`);
          completedOperations += selectedClientIds.length;
        }
      }

      results.success = results.errors.length === 0;
      setOperationResults(results);

      // Final progress update
      setProgress({
        completed: totalOperations,
        total: totalOperations,
        percentage: 100,
        currentOperation: 'Assignment complete'
      });

      if (results.success) {
        toast({
          title: "Assignment Successful",
          description: `Successfully created ${results.tasksCreated} tasks.`,
        });
      } else {
        toast({
          title: "Assignment Completed with Errors",
          description: `Created ${results.tasksCreated} tasks with ${results.errors.length} errors.`,
          variant: "destructive",
        });
      }

      return results.success;

    } catch (error) {
      console.error('Assignment execution failed:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Assignment Failed",
        description: "An unexpected error occurred during assignment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetOperation = () => {
    setSelectedTemplateIds([]);
    setSelectedClientIds([]);
    setAssignmentConfig({
      assignmentType: 'ad-hoc',
      customizePerClient: false
    });
    setIsProcessing(false);
    setProgress({
      completed: 0,
      total: 0,
      percentage: 0
    });
    setOperationResults(null);
    setError(null);
  };

  return {
    // Template selection
    selectedTemplateIds,
    setSelectedTemplateIds,
    availableTemplates,
    isTemplatesLoading,
    
    // Client selection
    selectedClientIds,
    setSelectedClientIds,
    availableClients,
    isClientsLoading,
    
    // Configuration
    assignmentConfig,
    setAssignmentConfig,
    
    // Processing
    isProcessing,
    progress,
    operationResults,
    error,
    
    // Actions
    executeAssignment,
    resetOperation,
    validateSelection
  };
};
