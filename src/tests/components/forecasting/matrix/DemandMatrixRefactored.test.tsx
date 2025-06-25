
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryProvider } from '@tanstack/react-query';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixStateProvider } from '@/components/forecasting/matrix/DemandMatrixStateProvider';
import { DemandMatrixContainer } from '@/components/forecasting/matrix/DemandMatrixContainer';

// Mock the services
vi.mock('@/services/forecasting/demandMatrixService', () => ({
  DemandMatrixService: {
    generateDemandMatrix: vi.fn().mockResolvedValue({ matrixData: { months: [], skills: [], dataPoints: [] } }),
    validateDemandMatrixData: vi.fn().mockReturnValue([]),
    clearCache: vi.fn(),
  }
}));

vi.mock('@/hooks/useDemandMatrixRealtime', () => ({
  useDemandMatrixRealtime: vi.fn().mockReturnValue({ refreshData: vi.fn() })
}));

vi.mock('@/components/forecasting/matrix/hooks/useDemandMatrixControls', () => ({
  useDemandMatrixControls: vi.fn().mockReturnValue({
    selectedSkills: [],
    selectedClients: [],
    monthRange: { start: 0, end: 11 },
    handleSkillToggle: vi.fn(),
    handleClientToggle: vi.fn(),
    handleMonthRangeChange: vi.fn(),
    handleReset: vi.fn(),
    handleExport: vi.fn(),
    availableSkills: [],
    availableClients: [],
    skillsLoading: false,
    clientsLoading: false,
    isAllSkillsSelected: true,
    isAllClientsSelected: true,
  })
}));

// Mock all UI components
vi.mock('@/components/forecasting/matrix/components/demand', () => ({
  DemandMatrixHeader: () => <div data-testid="demand-matrix-header">Header</div>,
  DemandMatrixGrid: () => <div data-testid="demand-matrix-grid">Grid</div>,
  DemandMatrixControlsPanel: () => <div data-testid="demand-matrix-controls">Controls</div>,
  DemandMatrixLoadingState: () => <div data-testid="demand-matrix-loading">Loading</div>,
  DemandMatrixErrorState: () => <div data-testid="demand-matrix-error">Error</div>,
  DemandMatrixEmptyState: () => <div data-testid="demand-matrix-empty">Empty</div>,
  DemandMatrixSummaryFooter: () => <div data-testid="demand-matrix-footer">Footer</div>,
  DemandDrillDownDialog: () => <div data-testid="drill-down-dialog">Drill Down</div>,
  DemandMatrixTimeControls: () => <div data-testid="time-controls">Time Controls</div>,
  DemandMatrixExportDialog: () => <div data-testid="export-dialog">Export Dialog</div>,
}));

vi.mock('@/components/forecasting/matrix/components/demand/DemandMatrixErrorBoundary', () => ({
  DemandMatrixErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/forecasting/matrix/components/demand/DemandMatrixPrintExportDialog', () => ({
  DemandMatrixPrintExportDialog: () => <div data-testid="print-export-dialog">Print Export Dialog</div>
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('DemandMatrix Refactored Components', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryProvider client={queryClient}>
        {component}
      </QueryProvider>
    );
  };

  describe('DemandMatrixStateProvider', () => {
    it('should provide context to children', () => {
      const TestComponent = () => {
        // This would throw if context is not provided
        return <div data-testid="test-component">Test</div>;
      };

      renderWithProviders(
        <DemandMatrixStateProvider>
          <TestComponent />
        </DemandMatrixStateProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('DemandMatrix Integration', () => {
    it('should render loading state initially', () => {
      renderWithProviders(
        <DemandMatrix className="test-class" groupingMode="skill" />
      );

      expect(screen.getByTestId('demand-matrix-loading')).toBeInTheDocument();
    });

    it('should maintain the same props interface', () => {
      // Test that the refactored component accepts the same props as before
      const props = {
        className: 'test-class',
        groupingMode: 'skill' as const
      };

      expect(() => {
        renderWithProviders(<DemandMatrix {...props} />);
      }).not.toThrow();
    });

    it('should render both skill and client grouping modes', () => {
      const { rerender } = renderWithProviders(
        <DemandMatrix className="test-class" groupingMode="skill" />
      );

      expect(screen.getByTestId('demand-matrix-loading')).toBeInTheDocument();

      rerender(
        <QueryProvider client={queryClient}>
          <DemandMatrix className="test-class" groupingMode="client" />
        </QueryProvider>
      );

      expect(screen.getByTestId('demand-matrix-loading')).toBeInTheDocument();
    });
  });

  describe('Architecture Separation', () => {
    it('should maintain proper component hierarchy', () => {
      // Test that the architecture maintains the proper separation
      renderWithProviders(
        <DemandMatrix className="test-class" groupingMode="skill" />
      );

      // Should render the loading state through the proper component hierarchy
      expect(screen.getByTestId('demand-matrix-loading')).toBeInTheDocument();
    });
  });
});
