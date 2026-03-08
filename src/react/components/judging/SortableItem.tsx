import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

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
      <div
        {...attributes}
        {...listeners}
        className={`absolute z-10 cursor-grab active:cursor-grabbing ${
          layout === 'vertical' ? 'right-2 top-2' : 'right-1.5 top-1.5'
        }`}
      >
        <div className="bg-slate-800/80 backdrop-blur-sm rounded p-1 hover:bg-slate-700 transition-colors">
          <GripVertical className="w-4 h-4 text-slate-400 hover:text-white transition-colors" />
        </div>
      </div>
      {children}
    </div>
  );
}
