import type { ComponentProps } from 'react';
import { cn } from '../ui/cn';

export function AdminTh({
  className,
  children,
  ...props
}: ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={cn(
        'px-3 py-2 whitespace-nowrap text-left text-tiny font-medium uppercase tracking-editorial text-subtle-foreground',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  className,
  children,
  ...props
}: ComponentProps<'td'>) {
  return (
    <td className={cn('px-3 py-1.5 whitespace-nowrap', className)} {...props}>
      {children}
    </td>
  );
}
