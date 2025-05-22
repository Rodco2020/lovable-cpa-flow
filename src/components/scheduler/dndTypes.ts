
import { TaskInstance } from "@/types/task";

// DnD item types
export const ItemTypes = {
  TASK: 'task',
};

// Interface for the draggable task item
export interface DragTaskItem {
  type: string;
  taskId: string;
  task: TaskInstance;
}

// Interface for droppable time slot
export interface DropTimeSlot {
  staffId: string;
  startTime: string;
  endTime: string;
}
