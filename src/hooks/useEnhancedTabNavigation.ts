
import { useCallback, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

interface TabNavigationContext {
  clientId?: string;
  taskId?: string;
  matrixFilters?: {
    forecastType?: 'virtual' | 'actual';
    dateRange?: { start: Date; end: Date };
    skills?: string[];
  };
  clientDetailFilters?: {
    dateRange?: { start: Date; end: Date };
    status?: string[];
    skills?: string[];
    categories?: string[];
    priorities?: string[];
    taskType?: 'all' | 'recurring' | 'instances';
  };
  fromTab?: string;
  scrollPosition?: number;
}

/**
 * Enhanced Tab Navigation Hook
 * Provides seamless navigation between tabs with context preservation
 * and URL routing for bookmarkable views
 */
export const useEnhancedTabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [navigationContext, setNavigationContext] = useState<TabNavigationContext>({});

  // Parse URL parameters to restore context
  const parseUrlContext = useCallback((): TabNavigationContext => {
    const urlParams = new URLSearchParams(location.search);
    const context: TabNavigationContext = {};

    // Extract client context
    const clientId = urlParams.get('clientId');
    if (clientId) context.clientId = clientId;

    const taskId = urlParams.get('taskId');
    if (taskId) context.taskId = taskId;

    // Extract matrix filters
    const forecastType = urlParams.get('forecastType') as 'virtual' | 'actual';
    const dateRangeStr = urlParams.get('dateRange');
    const skillsStr = urlParams.get('skills');

    if (forecastType || dateRangeStr || skillsStr) {
      context.matrixFilters = {};
      if (forecastType) context.matrixFilters.forecastType = forecastType;
      if (dateRangeStr) {
        try {
          const [start, end] = dateRangeStr.split(',');
          context.matrixFilters.dateRange = {
            start: new Date(start),
            end: new Date(end)
          };
        } catch (e) {
          console.warn('Invalid date range in URL:', dateRangeStr);
        }
      }
      if (skillsStr) {
        context.matrixFilters.skills = skillsStr.split(',');
      }
    }

    // Extract client detail filters
    const statusStr = urlParams.get('status');
    const categoriesStr = urlParams.get('categories');
    const prioritiesStr = urlParams.get('priorities');
    const taskType = urlParams.get('taskType') as 'all' | 'recurring' | 'instances';

    if (statusStr || categoriesStr || prioritiesStr || taskType) {
      context.clientDetailFilters = {};
      if (statusStr) context.clientDetailFilters.status = statusStr.split(',');
      if (categoriesStr) context.clientDetailFilters.categories = categoriesStr.split(',');
      if (prioritiesStr) context.clientDetailFilters.priorities = prioritiesStr.split(',');
      if (taskType) context.clientDetailFilters.taskType = taskType;
    }

    return context;
  }, [location.search]);

  // Update URL with navigation context
  const updateUrlContext = useCallback((context: TabNavigationContext, targetTab?: string) => {
    const params = new URLSearchParams();

    // Add client context
    if (context.clientId) params.set('clientId', context.clientId);
    if (context.taskId) params.set('taskId', context.taskId);

    // Add matrix filters
    if (context.matrixFilters) {
      if (context.matrixFilters.forecastType) {
        params.set('forecastType', context.matrixFilters.forecastType);
      }
      if (context.matrixFilters.dateRange) {
        const { start, end } = context.matrixFilters.dateRange;
        params.set('dateRange', `${start.toISOString()},${end.toISOString()}`);
      }
      if (context.matrixFilters.skills?.length) {
        params.set('skills', context.matrixFilters.skills.join(','));
      }
    }

    // Add client detail filters
    if (context.clientDetailFilters) {
      if (context.clientDetailFilters.status?.length) {
        params.set('status', context.clientDetailFilters.status.join(','));
      }
      if (context.clientDetailFilters.categories?.length) {
        params.set('categories', context.clientDetailFilters.categories.join(','));
      }
      if (context.clientDetailFilters.priorities?.length) {
        params.set('priorities', context.clientDetailFilters.priorities.join(','));
      }
      if (context.clientDetailFilters.taskType && context.clientDetailFilters.taskType !== 'all') {
        params.set('taskType', context.clientDetailFilters.taskType);
      }
    }

    // Add target tab if specified
    if (targetTab) {
      params.set('tab', targetTab);
    }

    setSearchParams(params);
  }, [setSearchParams]);

  // Navigate to Client Details with context
  const navigateToClientDetails = useCallback((options: TabNavigationContext = {}) => {
    const currentContext = parseUrlContext();
    const mergedContext = { ...currentContext, ...options, fromTab: 'matrix' };
    
    setNavigationContext(mergedContext);
    updateUrlContext(mergedContext, 'client-details');
    
    console.log('Navigate to Client Details with context:', mergedContext);
  }, [parseUrlContext, updateUrlContext]);

  // Navigate to Matrix with context
  const navigateToMatrix = useCallback((options: TabNavigationContext = {}) => {
    const currentContext = parseUrlContext();
    const mergedContext = { ...currentContext, ...options, fromTab: 'client-details' };
    
    setNavigationContext(mergedContext);
    updateUrlContext(mergedContext, 'matrix');
    
    console.log('Navigate to Matrix with context:', mergedContext);
  }, [parseUrlContext, updateUrlContext]);

  // Navigate with preserved context
  const navigateWithContext = useCallback((
    targetTab: 'matrix' | 'client-details' | 'charts' | 'gaps',
    additionalContext: TabNavigationContext = {}
  ) => {
    const currentContext = parseUrlContext();
    const mergedContext = { ...currentContext, ...additionalContext };
    
    setNavigationContext(mergedContext);
    updateUrlContext(mergedContext, targetTab);
    
    console.log(`Navigate to ${targetTab} with preserved context:`, mergedContext);
  }, [parseUrlContext, updateUrlContext]);

  // Get current context from URL
  const getCurrentContext = useCallback((): TabNavigationContext => {
    return parseUrlContext();
  }, [parseUrlContext]);

  // Clear navigation context
  const clearContext = useCallback(() => {
    setNavigationContext({});
    setSearchParams({});
  }, [setSearchParams]);

  return {
    navigateToClientDetails,
    navigateToMatrix,
    navigateWithContext,
    getCurrentContext,
    clearContext,
    navigationContext
  };
};
