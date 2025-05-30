
export { ClientMetricsFiltersComponent } from './ClientMetricsFilters';
export { FilterToggleHeader } from './FilterToggleHeader';
export { ActiveFiltersDisplay } from './ActiveFiltersDisplay';
export { FilterControls } from './FilterControls';

// Export sub-components for potential reuse
export {
  IndustryFilter,
  StatusFilter,
  StaffLiaisonFilter,
  ResetFiltersButton
} from './components';

// Export hooks for potential reuse
export { useFilterHandlers } from './hooks/useFilterHandlers';
