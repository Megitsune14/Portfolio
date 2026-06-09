import type { Goal, SubGoal } from '../../types/goals';

export type GoalProgressContext = {
  currentWeightKg: number | null | undefined;
  profileWeightKg: number | null | undefined;
};

export type GoalProgressResult = {
  percent: number;
  detail: string;
};

function subGoalRatio(subs: SubGoal[] | undefined): number | null {
  const list = subs ?? [];
  if (list.length === 0) return null;
  const done = list.filter((s) => s.status === 'completed').length;
  return done / list.length;
}

function weightRatio(currentKg: number, targetKg: number, refKg: number): number | null {
  const span = Math.abs(refKg - targetKg);
  if (span < 1e-6) return null;
  if (targetKg < refKg) {
    const raw = (refKg - currentKg) / (refKg - targetKg);
    return Math.min(1, Math.max(0, raw));
  }
  if (targetKg > refKg) {
    const raw = (currentKg - refKg) / (targetKg - refKg);
    return Math.min(1, Math.max(0, raw));
  }
  return null;
}

function formatKg(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
}

export function computeGoalProgress(
  goal: Pick<Goal, 'status' | 'targetWeightKg' | 'subGoals'>,
  ctx: GoalProgressContext,
  options?: { overrideTargetKg?: number | null },
): GoalProgressResult | null {
  if (goal.status === 'completed') {
    return { percent: 100, detail: 'Objectif marqué terminé' };
  }

  const subs = goal.subGoals ?? [];
  const subR = subGoalRatio(subs);
  const targetKg = options?.overrideTargetKg ?? goal.targetWeightKg ?? null;
  const cur = ctx.currentWeightKg ?? null;
  const ref = ctx.profileWeightKg ?? null;

  let wR: number | null = null;
  if (targetKg != null && cur != null && ref != null) {
    wR = weightRatio(cur, targetKg, ref);
  }

  const parts: number[] = [];
  const detailBits: string[] = [];

  if (subR !== null) {
    parts.push(subR);
    const done = subs.filter((s) => s.status === 'completed').length;
    detailBits.push(`${done}/${subs.length} sous-objectifs`);
  }

  if (wR !== null) {
    parts.push(wR);
    detailBits.push(`${formatKg(cur!)} kg → cible ${formatKg(targetKg!)} kg`);
  }

  if (parts.length === 0) return null;

  const percent = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
  return {
    percent: Math.min(100, Math.max(0, percent)),
    detail: detailBits.join(' · '),
  };
}
