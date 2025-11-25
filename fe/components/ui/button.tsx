'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base classes - common to all variants
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        // Exact match for current theme toggle styling
        outline:
          'relative border border-primary/20 hover:border-primary/40 hover:drop-shadow-[0_0_12px_var(--color-primary)] group',
        // Exact match for current sign in button styling
        default:
          'border border-primary text-primary-foreground bg-primary hover:opacity-90',
        // Ghost variant for subtle buttons
        ghost:
          'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        // Exact match for theme toggle dimensions
        icon: 'w-10 h-10',
        // Exact match for sign in button padding and text size
        default: 'px-4 sm:px-6 py-1 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
