
/**
 * useClientDetailReport Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClientDetailReport } from '@/components/reporting/ClientDetailReport/hooks/useClientDetailReport';
import { getClientDetailReport, getClientsList } from '@/services/reporting/clientDetailReportService';
import { ExportService } from '@/services/reporting/exportService';

// Mock the services
jest.mock('@/services/reporting/clientDetailReportService');
jest.mock('@/services/reporting/exportService');

const mockGetClientsList = getClientsList as jest.MockedFunction<typeof getClientsList>;
const mockGetClientDetailReport = getClientDetailReport as jest.MockedFunction<typeof getClientDetailReport>;
const mockExportService = ExportService as jest.Mocked<typeof ExportService>;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useClientDetailReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClientsList.mockResolvedValue([]);
    mockGetClientDetailReport.mockResolvedValue({
      client: {
        id: 'test-client',
        legalName: 'Test Client',
        primaryContact: 'John Doe',
        email: 'test@example.com',
        phone: '123-456-7890',
        industry: 'Technology',
        status: 'Active',
        expectedMonthlyRevenue: 5000,
        staffLiaisonName: 'Jane Smith'
      },
      taskMetrics: {
        totalTasks: 10,
        completedTasks: 5,
        activeTasks: 5,
        overdueTasks: 1,
        totalEstimatedHours: 20,
        completedHours: 10,
        remainingHours: 10,
        completionRate: 50,
        averageTaskDuration: 2.5
      },
      revenueMetrics: {
        expectedMonthlyRevenue: 5000,
        ytdProjectedRevenue: 60000,
        taskValueBreakdown: []
      },
      taskBreakdown: {
        recurring: [],
        adhoc: []
      },
      timeline: []
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    expect(result.current.selectedClientId).toBe("");
    expect(result.current.showCustomizationDialog).toBe(false);
    expect(result.current.showExportDialog).toBe(false);
    expect(result.current.filters.includeCompleted).toBe(true);
    expect(result.current.customization.title).toBe("Client Detail Report");
  });

  it('should update selected client ID', () => {
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    act(() => {
      result.current.setSelectedClientId("client-123");
    });

    expect(result.current.selectedClientId).toBe("client-123");
  });

  it('should handle filters change', () => {
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    act(() => {
      result.current.handleFiltersChange({
        includeCompleted: false,
        taskTypes: ['recurring']
      });
    });

    expect(result.current.filters.includeCompleted).toBe(false);
    expect(result.current.filters.taskTypes).toEqual(['recurring']);
  });

  it('should handle export with PDF format', async () => {
    mockExportService.exportToPDF = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    // Set up some mock report data
    act(() => {
      result.current.setSelectedClientId("client-123");
    });

    await waitFor(() => {
      expect(result.current.reportData).toBeDefined();
    });

    await act(async () => {
      await result.current.handleExport({
        format: 'pdf',
        includeCharts: true,
        includeTaskDetails: true,
        includeTimeline: true,
        customFields: []
      });
    });

    expect(mockExportService.exportToPDF).toHaveBeenCalled();
  });

  it('should handle export with Excel format', async () => {
    mockExportService.exportToExcel = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    act(() => {
      result.current.setSelectedClientId("client-123");
    });

    await act(async () => {
      await result.current.handleExport({
        format: 'excel',
        includeCharts: true,
        includeTaskDetails: true,
        includeTimeline: true,
        customFields: []
      });
    });

    expect(mockExportService.exportToExcel).toHaveBeenCalled();
  });

  it('should handle export with CSV format', async () => {
    mockExportService.exportToCSV = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    act(() => {
      result.current.setSelectedClientId("client-123");
    });

    await act(async () => {
      await result.current.handleExport({
        format: 'csv',
        includeCharts: false,
        includeTaskDetails: true,
        includeTimeline: true,
        customFields: []
      });
    });

    expect(mockExportService.exportToCSV).toHaveBeenCalled();
  });

  it('should handle print functionality', () => {
    mockExportService.exportToPDF = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    act(() => {
      result.current.setSelectedClientId("client-123");
    });

    act(() => {
      result.current.handlePrint();
    });

    expect(mockExportService.exportToPDF).toHaveBeenCalledWith(
      expect.any(Object),
      {
        format: 'pdf',
        includeCharts: result.current.customization.showCharts,
        includeTaskDetails: true,
        includeTimeline: true,
        customFields: []
      },
      result.current.customization
    );
  });

  it('should toggle dialog states', () => {
    const { result } = renderHook(() => useClientDetailReport(), { wrapper });

    act(() => {
      result.current.setShowCustomizationDialog(true);
    });

    expect(result.current.showCustomizationDialog).toBe(true);

    act(() => {
      result.current.setShowExportDialog(true);
    });

    expect(result.current.showExportDialog).toBe(true);
  });
});
