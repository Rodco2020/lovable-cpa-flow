
# Demand Matrix Controls Panel

## Overview

The Demand Matrix Controls Panel is a comprehensive control interface for managing demand matrix filtering and display options. It has been refactored into smaller, focused components to improve maintainability and testability.

## Architecture

### Main Component
- **DemandMatrixControlsPanel.tsx**: The main orchestrating component that combines all sub-components

### Sub-Components
- **ControlsPanelHeader**: Handles expand/collapse functionality
- **TimeRangeControlSection**: Manages month range selection with dual sliders
- **SkillsFilterSection**: Handles skill selection with checkboxes and select all/none
- **ClientsFilterSection**: Manages client filtering with similar functionality to skills
- **ActionButtonsSection**: Contains export, print, and reset action buttons
- **CurrentSelectionSummary**: Displays current filter state summary
- **PreferredStaffFilterSection**: Advanced staff selection with enhanced UI

### Utilities
- **selectionUtils.ts**: Common utility functions for selection state management

## Key Features

1. **Collapsible Interface**: Expand/collapse to save screen space
2. **Time Range Selection**: Dual sliders for start and end month selection
3. **Multi-Filter Support**: Skills, clients, and preferred staff filtering
4. **Select All/None**: Bulk selection operations for each filter type
5. **Export Functionality**: Data export and print report capabilities
6. **State Summary**: Real-time display of current filter selections
7. **Responsive Design**: Works across different screen sizes

## Component Props

### DemandMatrixControlsPanelProps
```typescript
interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  onPrintExport?: () => void;
}
```

## Testing

Comprehensive test coverage includes:
- Component rendering and interaction tests
- Utility function unit tests
- Integration tests for complex interactions
- Accessibility testing
- Edge case handling

Run tests with:
```bash
npm test -- DemandMatrixControlsPanel
```

## Usage Example

```typescript
import { DemandMatrixControlsPanel } from './DemandMatrixControlsPanel';

<DemandMatrixControlsPanel
  isControlsExpanded={true}
  onToggleControls={() => setExpanded(!expanded)}
  selectedSkills={selectedSkills}
  selectedClients={selectedClients}
  selectedPreferredStaff={selectedStaff}
  onSkillToggle={handleSkillToggle}
  onClientToggle={handleClientToggle}
  onPreferredStaffToggle={handleStaffToggle}
  monthRange={{ start: 0, end: 11 }}
  onMonthRangeChange={handleRangeChange}
  onExport={handleExport}
  onReset={handleReset}
  groupingMode="skill"
  availableSkills={skills}
  availableClients={clients}
  availablePreferredStaff={staff}
  onPrintExport={handlePrintExport}
/>
```

## Maintenance Notes

1. **State Management**: All state is managed by parent components; this panel is purely presentational
2. **Performance**: Each sub-component is optimized to minimize re-renders
3. **Accessibility**: All interactive elements include proper ARIA labels and keyboard navigation
4. **Extensibility**: New filter types can be added by creating similar section components
5. **Testing**: Each component has corresponding test files to ensure functionality

## Future Enhancements

- Keyboard shortcuts for common operations
- Filter presets and saving
- Advanced search within filter options
- Drag-and-drop reordering of filter sections
