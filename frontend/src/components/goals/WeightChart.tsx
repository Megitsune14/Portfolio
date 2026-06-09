import type { WeightEntry } from '../../types/goals';

type Props = {
  entries: WeightEntry[];
  targetWeightKg?: number;
  className?: string;
};

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 36, left: 48 };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function WeightChart({ entries, targetWeightKg, className }: Props) {
  if (entries.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-theme bg-(--secondary)/15 text-sm text-muted ${className ?? 'h-64'}`}
      >
        Aucune pesée enregistrée
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
  );

  const weights = sorted.map((e) => e.weightKg);
  const yMin = Math.min(...weights, targetWeightKg ?? Infinity) - 2;
  const yMax = Math.max(...weights, targetWeightKg ?? -Infinity) + 2;
  const yRange = yMax - yMin || 1;

  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const points = sorted.map((entry, index) => {
    const x =
      sorted.length === 1
        ? PADDING.left + chartW / 2
        : PADDING.left + (index / (sorted.length - 1)) * chartW;
    const y = PADDING.top + chartH - ((entry.weightKg - yMin) / yRange) * chartH;
    return { x, y, entry };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const targetY =
    targetWeightKg != null
      ? PADDING.top + chartH - ((targetWeightKg - yMin) / yRange) * chartH
      : null;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = yMin + (yRange * i) / yTicks;
    const y = PADDING.top + chartH - (i / yTicks) * chartH;
    return { value, y };
  });

  const xLabelIndices =
    sorted.length <= 5
      ? sorted.map((_, i) => i)
      : [0, Math.floor(sorted.length / 2), sorted.length - 1];

  return (
    <div className={`w-full overflow-x-auto ${className ?? ''}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full min-h-72 w-full min-w-[320px]"
        role="img"
        aria-label="Graphique d'évolution du poids"
      >
        {yLabels.map((tick) => (
          <g key={tick.value}>
            <line
              x1={PADDING.left}
              y1={tick.y}
              x2={WIDTH - PADDING.right}
              y2={tick.y}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fontSize="10"
            >
              {tick.value.toFixed(1)}
            </text>
          </g>
        ))}

        {targetY != null && targetWeightKg != null ? (
          <>
            <line
              x1={PADDING.left}
              y1={targetY}
              x2={WIDTH - PADDING.right}
              y2={targetY}
              stroke="var(--accent)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
            />
            <text
              x={WIDTH - PADDING.right}
              y={targetY - 6}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fontSize="10"
            >
              Cible {targetWeightKg} kg
            </text>
          </>
        ) : null}

        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinejoin="round" />

        {points.map((point) => (
          <g key={point.entry._id}>
            <circle cx={point.x} cy={point.y} r={4} fill="var(--primary)" />
            <title>
              {`${point.entry.weightKg} kg — ${new Date(point.entry.measuredAt).toLocaleString('fr-FR')}`}
            </title>
          </g>
        ))}

        {xLabelIndices.map((index) => {
          const point = points[index];
          if (!point) return null;
          return (
            <text
              key={sorted[index]._id}
              x={point.x}
              y={HEIGHT - 10}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="10"
            >
              {formatDate(sorted[index].measuredAt)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
