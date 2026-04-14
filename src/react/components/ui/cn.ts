import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const COLOR_TOKENS = [
  'background',
  'foreground',
  'muted-foreground',
  'subtle-foreground',
  'surface',
  'surface-raised',
  'surface-hover',
  'accent',
  'accent-hover',
  'accent-foreground',
  'accent-muted',
  'border',
  'border-strong',
  'ring',
  'destructive',
  'destructive-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'gold',
  'gold-foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'input',
];

const FONT_SIZE_TOKENS = ['tiny', 'editorial'];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZE_TOKENS }],
      'text-color': [{ text: COLOR_TOKENS }],
      'bg-color': [{ bg: COLOR_TOKENS }],
      'border-color': [{ border: COLOR_TOKENS }],
      'ring-color': [{ ring: COLOR_TOKENS }],
      'tracking': [
        {
          tracking: [
            'editorial',
            'editorial-wide',
            'editorial-wider',
            'display',
            'display-tight',
          ],
        },
      ],
      'leading': [
        {
          leading: [
            'display',
            'display-tight',
            'heading',
            'paragraph',
            'body',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
