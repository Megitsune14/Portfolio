import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/40 bg-primary/15 text-foreground',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border text-muted-foreground',
        success: 'border-primary/40 bg-primary/15 text-foreground',
        destructive: 'border-primary/40 bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
