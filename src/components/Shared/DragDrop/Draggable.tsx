import { DragEvent } from 'react';

interface DraggableProps {
  clasName?: string
  children?: React.ReactNode;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
}
export default function Draggable(props: DraggableProps) {
  const onDragStart = (e: DragEvent<HTMLElement>) => {
    if (props.onDragStart) {
      props.onDragStart(e);
    }
  };
  return (
    <div className={props.clasName} onDragStart={onDragStart} draggable>
      {props.children}
    </div>
  );
}
