
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Edit, 
  Archive, 
  Eye,
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';
import { TaskTemplate } from '@/types/task';
import { getTaskTemplates, TaskServiceError } from '@/services/taskService';
import ErrorBoundary from '@/components/ErrorBoundary';

const TaskTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch templates with enhanced error handling
  const fetchTemplates = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      console.log('Fetching task templates...');
      const fetchedTemplates = await getTaskTemplates(includeArchived);
      
      console.log(`Successfully fetched ${fetchedTemplates.length} templates`);
      setTemplates(fetchedTemplates);
      setFilteredTemplates(fetchedTemplates);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching task templates:', err);
      
      let errorMessage = 'Failed to load task templates';
      
      if (err instanceof TaskServiceError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Don't clear templates on error so user can still see cached data
      if (templates.length === 0) {
        // Only show empty state if we have no cached data
        setTemplates([]);
        setFilteredTemplates([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry with exponential backoff
  const handleRetry = async () => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
    setRetryCount(prev => prev + 1);
    
    if (delay > 1000) {
      console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, [includeArchived]);

  // Filter templates based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    const filtered = templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.requiredSkills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setFilteredTemplates(filtered);
  }, [searchTerm, templates]);

  // Error state
  if (error && templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify database permissions</li>
              <li>• Ensure task templates exist in the database</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p>Error displaying task templates</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Task Templates</span>
            <div className="flex items-center gap-2">
              {error && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchTemplates(false)}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
              )}
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show error banner if we have cached data */}
          {error && templates.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Warning: {error} (showing cached data)</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(e) => setIncludeArchived(e.target.checked)}
                  className="rounded"
                />
                <span>Include archived</span>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {templates.length === 0 ? (
                <div>
                  <Database className="h-8 w-8 mx-auto mb-2" />
                  <p>No task templates found</p>
                  <p className="text-sm">Create your first template to get started</p>
                </div>
              ) : (
                <div>
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No templates match your search</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge variant="outline">{template.defaultPriority}</Badge>
                        {template.isArchived && (
                          <Badge variant="destructive">Archived</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {template.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{template.defaultEstimatedHours} hours</span>
                        <span>•</span>
                        <span>
                          Skills: {template.requiredSkills.length > 0 
                            ? template.requiredSkills.join(', ')
                            : 'None specified'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {!isLoading && filteredTemplates.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm text-gray-500">
              Showing {filteredTemplates.length} of {templates.length} templates
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default TaskTemplateList;
