import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../ui/cn';

type SortableItemProps = {
  id: string;
  children: React.ReactNode;
  layout?: 'vertical' | 'grid';
};

export function SortableItem({
  id,
  children,
  layout = 'grid',
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? '0.97' : '1',
    zIndex: isDragging ? 50 : ('auto' as number | string),
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Trascina per riordinare"
        className={cn(
          'absolute z-10 cursor-grab rounded-md bg-background/70 p-1 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
          layout === 'vertical' ? 'top-2 right-2' : 'top-1.5 right-1.5'
        )}
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </div>
  );
}
