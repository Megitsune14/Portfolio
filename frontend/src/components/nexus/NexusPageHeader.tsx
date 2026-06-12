import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function NexusPageHeader({ title, description, actions, className }: Props) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h1 className="font-jp text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
