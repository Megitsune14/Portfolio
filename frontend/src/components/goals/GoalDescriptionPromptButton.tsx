import { useState } from 'react';
import { buildGoalDescriptionPromptText, type PromptDashboardSummary } from '../../lib/goals/goalDescriptionPrompt';
import type { Profile } from '../../types/goals';

type Props = {
  profile: Profile | null;
  summary: PromptDashboardSummary | null | undefined;
  goalTitle: string;
  goalTargetKgStr: string;
  subGoalTitles?: string[];
};

export function GoalDescriptionPromptButton({
  profile,
  summary,
  goalTitle,
  goalTargetKgStr,
  subGoalTitles,
}: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'err'>('idle');

  const copy = async () => {
    const text = buildGoalDescriptionPromptText({
      profile,
      summary,
      goalTitle,
      goalTargetKgStr,
      subGoalTitles,
    });

    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
      window.setTimeout(() => setState('idle'), 2200);
    } catch {
      setState('err');
      window.setTimeout(() => setState('idle'), 3200);
    }
  };

  return (
    <button
      type="button"
      className="focus-ring shrink-0 rounded-lg border border-theme px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted transition-colors hover:bg-(--secondary)"
      onClick={copy}
      title="Copie un prompt à coller dans une IA, puis colle la réponse dans le champ description"
    >
      {state === 'copied' ? 'Copié !' : state === 'err' ? 'Échec' : 'Prompt'}
    </button>
  );
}
