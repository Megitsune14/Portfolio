import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function NexusLoadingState({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-1 items-center justify-center py-16', className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}

export function NexusErrorState({ message, className }: { message: string; className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-6 text-sm text-foreground">{message}</CardContent>
    </Card>
  );
}

export function NexusEmptyState({ message, className }: { message: string; className?: string }) {
  return (
    <p className={cn('py-8 text-center text-sm text-muted-foreground', className)}>{message}</p>
  );
}

export function NexusStatCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}
