
import { RecurringTask, TaskInstance } from "@/types/task";

/**
 * Base props for TaskSelectionList component
 */
export interface BaseTaskSelectionListProps {
  selectedTaskIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  onSelectAll?: (tasks: any[]) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

/**
 * TaskSelectionList props with generic type parameter
 */
export interface TaskSelectionListProps<T extends TaskInstance | RecurringTask> extends BaseTaskSelectionListProps {
  tasks: T[];
  type: "ad-hoc" | "recurring";
}

/**
 * Props for TaskSelectionPanel component
 */
export interface TaskSelectionPanelProps {
  tasks: TaskInstance[] | RecurringTask[];
  selectedTaskIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  type: "ad-hoc" | "recurring";
  onSelectAll?: (tasks: any[]) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}
