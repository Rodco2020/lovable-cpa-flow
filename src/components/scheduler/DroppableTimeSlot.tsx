
import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes, DragTaskItem } from './dndTypes';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface DroppableTimeSlotProps {
  staffId: string;
  startTime: string;
  endTime: string;
  onDrop: (taskId: string, staffId: string, startTime: string, endTime: string) => void;
  isDisabled?: boolean;
}

const DroppableTimeSlot: React.FC<DroppableTimeSlotProps> = ({
  staffId,
  startTime,
  endTime,
  onDrop,
  isDisabled = false
}) => {
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    canDrop: () => !isDisabled,
    drop: (item: DragTaskItem) => {
      onDrop(item.taskId, staffId, startTime, endTime);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Determine the visual state for feedback
  const isActive = isOver && canDrop;
  const isInvalid = isOver && !canDrop;

  // Style based on drop state
  let slotClassName = "flex items-center p-2 my-1 border rounded transition-colors duration-200 ";
  
  if (isDisabled) {
    slotClassName += "bg-gray-100 cursor-not-allowed opacity-50";
  } else if (isActive) {
    slotClassName += "bg-green-100 border-green-500";
  } else if (isInvalid) {
    slotClassName += "bg-red-100 border-red-500";
  } else {
    slotClassName += "hover:bg-blue-50 cursor-pointer";
  }

  return (
    <div ref={drop} className={slotClassName}>
      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
      <span className="text-sm">
        {startTime} - {endTime}
      </span>
    </div>
  );
};

export default DroppableTimeSlot;
