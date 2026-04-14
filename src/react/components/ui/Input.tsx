import type { ComponentProps, ReactNode } from 'react';
import { cn } from './cn';

const FIELD_CLASSES =
  'w-full px-4 py-3 bg-surface-raised border border-border rounded-xl text-foreground placeholder-subtle-foreground font-light leading-paragraph focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all';

const LABEL_CLASSES =
  'block text-editorial uppercase tracking-editorial-wider text-muted-foreground mb-2';

type FieldWrapperProps = {
  id?: string;
  label?: string;
  children: ReactNode;
};

function FieldWrapper({ id, label, children }: FieldWrapperProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className={LABEL_CLASSES}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

type InputProps = ComponentProps<'input'> & {
  label?: string;
};

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <FieldWrapper id={id} label={label}>
      <input id={id} className={cn(FIELD_CLASSES, className)} {...props} />
    </FieldWrapper>
  );
}

type TextareaProps = ComponentProps<'textarea'> & {
  label?: string;
};

export function Textarea({
  className,
  label,
  id,
  rows = 3,
  ...props
}: TextareaProps) {
  return (
    <FieldWrapper id={id} label={label}>
      <textarea
        id={id}
        rows={rows}
        className={cn(FIELD_CLASSES, className)}
        {...props}
      />
    </FieldWrapper>
  );
}
