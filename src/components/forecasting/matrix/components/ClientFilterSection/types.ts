
export interface Client {
  id: string;
  legal_name: string;
  industry: string;
  status: string;
}

export interface ClientFilterSectionProps {
  selectedClientIds: string[];
  onClientSelectionChange: (clientIds: string[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface ClientSearchState {
  searchTerm: string;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}
