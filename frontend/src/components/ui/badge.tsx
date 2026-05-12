import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
        variant === 'default' &&
          'bg-primary text-primary-foreground',
        variant === 'secondary' &&
          'bg-secondary text-secondary-foreground',
        variant === 'destructive' &&
          'bg-destructive text-destructive-foreground',
        variant === 'outline' &&
          'border border-border text-foreground',
        className
      )}
      {...props}
    />
  );
}