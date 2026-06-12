import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string | number;
  className?: string;
};

export function NexusStatCard({ label, value, className }: Props) {
  const display =
    typeof value === 'number' ? value.toLocaleString('fr-FR') : value;

  return (
    <Card className={cn(className)}>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 font-jp text-2xl font-bold text-foreground sm:text-3xl">{display}</p>
      </CardContent>
    </Card>
  );
}
