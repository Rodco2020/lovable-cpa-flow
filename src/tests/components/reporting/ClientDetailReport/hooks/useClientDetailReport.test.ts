
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClientDetailReport } from '@/components/reporting/ClientDetailReport/hooks/useClientDetailReport';
import * as clientDetailReportService from '@/services/reporting/clientDetail/clientDetailReportService';

// Mock the service
jest.mock('@/services/reporting/clientDetail/clientDetailReportService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useClientDetailReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useClientDetailReport(), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedClientId).toBe('');
    expect(result.current.reportData).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch report data when client is selected', async () => {
    const mockReportData = {
      client: {
        id: 'client-1',
        legalName: 'Test Client',
        primaryContact: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        industry: 'Technology',
        status: 'Active'
      },
      taskMetrics: {
        totalTasks: 10,
        completedTasks: 5,
        overdueTasks: 1,
        completionRate: 50,
        averageDuration: 5
      },
      revenueMetrics: {
        expectedMonthlyRevenue: 5000,
        ytdProjectedRevenue: 60000,
        taskValueBreakdown: {}
      },
      taskBreakdown: {
        recurring: [],
        adhoc: []
      },
      timeline: []
    };

    (clientDetailReportService.getClientDetailReport as jest.Mock).mockResolvedValue(mockReportData);

    const { result } = renderHook(() => useClientDetailReport(), {
      wrapper: createWrapper(),
    });

    result.current.setSelectedClientId('client-1');

    await waitFor(() => {
      expect(result.current.reportData).toEqual(mockReportData);
    });
  });
});
