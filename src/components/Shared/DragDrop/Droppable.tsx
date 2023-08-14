import { DragEvent } from 'react';

interface DroppableProps {
  className?: string
  children?: React.ReactNode;
  onDrop?: (e: DragEvent<HTMLElement>) => void;
  onDragOver?: (e: DragEvent<HTMLElement>) => void;
}
export default function Droppable(props: DroppableProps) {
  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (props.onDrop) {
      props.onDrop(e);
    }
  };
  const onDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (props.onDragOver) {
      props.onDragOver(e);
    }
  };
  return (
    <div className={props.className} onDrop={onDrop} onDragOver={onDragOver}>
      {props.children}
    </div>
  );
}
