
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye,
  Loader2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { TaskTemplate } from '@/types/task';
import { createTaskTemplate } from '@/services/taskService';
import { toast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

interface ValidationSuggestion {
  field: string;
  current: any;
  suggested: any;
  reason: string;
}

interface TemplateValidatorProps {
  template: Partial<TaskTemplate>;
  onValidationComplete: (results: ValidationResult) => void;
}

export const TemplateValidator: React.FC<TemplateValidatorProps> = ({
  template,
  onValidationComplete
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Validate template when it changes
  useEffect(() => {
    validateTemplate();
  }, [template]);

  const validateTemplate = async () => {
    setIsValidating(true);
    
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = performValidation(template);
      setValidationResults(results);
      onValidationComplete(results);
    } finally {
      setIsValidating(false);
    }
  };

  const performValidation = (template: Partial<TaskTemplate>): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Required field validation
    if (!template.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Template name is required',
        severity: 'error'
      });
    } else if (template.name.length < 3) {
      warnings.push({
        field: 'name',
        message: 'Template name is very short',
        suggestion: 'Consider using a more descriptive name'
      });
    }

    if (!template.description?.trim()) {
      errors.push({
        field: 'description',
        message: 'Template description is required',
        severity: 'error'
      });
    } else if (template.description.length < 10) {
      warnings.push({
        field: 'description',
        message: 'Description is very brief',
        suggestion: 'Add more details about the template purpose and scope'
      });
    }

    if (!template.defaultEstimatedHours || template.defaultEstimatedHours <= 0) {
      errors.push({
        field: 'defaultEstimatedHours',
        message: 'Estimated hours must be greater than 0',
        severity: 'error'
      });
    } else if (template.defaultEstimatedHours > 40) {
      warnings.push({
        field: 'defaultEstimatedHours',
        message: 'Estimated hours is unusually high',
        suggestion: 'Consider breaking down large tasks into smaller templates'
      });
    }

    if (!template.defaultPriority) {
      errors.push({
        field: 'defaultPriority',
        message: 'Default priority is required',
        severity: 'error'
      });
    }

    if (!template.category) {
      errors.push({
        field: 'category',
        message: 'Category is required',
        severity: 'error'
      });
    }

    // Skills validation
    if (!template.requiredSkills || template.requiredSkills.length === 0) {
      warnings.push({
        field: 'requiredSkills',
        message: 'No required skills specified',
        suggestion: 'Consider adding skills to improve task assignment accuracy'
      });
    } else if (template.requiredSkills.length > 5) {
      warnings.push({
        field: 'requiredSkills',
        message: 'Many skills required',
        suggestion: 'Too many skills might limit assignment options'
      });
    }

    // Business logic suggestions
    if (template.defaultEstimatedHours && template.defaultEstimatedHours < 0.5) {
      suggestions.push({
        field: 'defaultEstimatedHours',
        current: template.defaultEstimatedHours,
        suggested: 0.5,
        reason: 'Minimum recommended task duration is 30 minutes'
      });
    }

    if (template.name && template.name.toLowerCase().includes('template')) {
      suggestions.push({
        field: 'name',
        current: template.name,
        suggested: template.name.replace(/template/gi, '').trim(),
        reason: 'Template name should describe the task, not mention "template"'
      });
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      suggestions
    };
  };

  const handleCreateTemplate = async () => {
    if (!validationResults?.isValid) return;

    setIsCreating(true);
    
    try {
      const templateData = {
        name: template.name!,
        description: template.description!,
        defaultEstimatedHours: template.defaultEstimatedHours!,
        requiredSkills: template.requiredSkills || [],
        defaultPriority: template.defaultPriority!,
        category: template.category!
      };

      const result = await createTaskTemplate(templateData);
      
      if (result) {
        toast({
          title: "Template Created",
          description: `Template "${template.name}" has been created successfully.`,
        });
        
        // Mark validation as complete with success
        onValidationComplete({
          ...validationResults,
          isValid: true
        });
      } else {
        throw new Error("Failed to create template");
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Validating template...</span>
        </div>
      </div>
    );
  }

  if (!validationResults) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No validation results available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {validationResults.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            Validation Results
            <Badge 
              variant={validationResults.isValid ? "default" : "destructive"} 
              className="ml-2"
            >
              {validationResults.isValid ? "Valid" : "Invalid"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {validationResults.errors.length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {validationResults.warnings.length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {validationResults.suggestions.length}
              </div>
              <div className="text-sm text-muted-foreground">Suggestions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {validationResults.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Errors (Must Fix)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {validationResults.errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{error.field}:</strong> {error.message}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validationResults.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Warnings (Recommended)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {validationResults.warnings.map((warning, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{warning.field}:</strong> {warning.message}
                  {warning.suggestion && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Suggestion: {warning.suggestion}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {validationResults.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Eye className="h-5 w-5 mr-2" />
              Suggestions (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationResults.suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm">{suggestion.field}</strong>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {suggestion.reason}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Current:</span> {String(suggestion.current)}
                  </div>
                  <div>
                    <span className="font-medium">Suggested:</span> {String(suggestion.suggested)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="h-5 w-5 mr-2" />
            Template Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{template.name}</span>
              <div className="flex space-x-2">
                <Badge variant="outline">{template.category}</Badge>
                <Badge variant="outline">{template.defaultPriority}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span>Estimated Hours: <strong>{template.defaultEstimatedHours}h</strong></span>
              <span>Required Skills: <strong>{template.requiredSkills?.length || 0}</strong></span>
            </div>
            {template.requiredSkills && template.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleCreateTemplate}
          disabled={!validationResults.isValid || isCreating}
          className="flex items-center"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Template...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
