import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none',

        // size
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',

        // variants
        variant === 'default' &&
          'bg-primary text-primary-foreground hover:opacity-90',
        variant === 'outline' &&
          'border border-border bg-transparent hover:bg-muted',
        variant === 'ghost' &&
          'bg-transparent hover:bg-muted',
        variant === 'destructive' &&
          'bg-red-500 text-white hover:bg-red-600',

        className
      )}
      {...props}
    />
  );
}