import type { Gender, Profile } from '../../types/goals';
import { getImcCategoryLabel } from './imc';

export type PromptDashboardSummary = {
  currentWeight: number | null;
  heightCm: number | null;
  bmi: number | null;
};

function parseOptionalKg(s: string | undefined | null): number | undefined {
  const t = s?.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function genderIntro(gender: Gender): { line: string; subject: 'il' | 'elle' } {
  switch (gender) {
    case 'Homme':
      return { line: "L'utilisateur est un homme.", subject: 'il' };
    case 'Femme':
      return { line: "L'utilisateur est une femme.", subject: 'elle' };
    case 'MTF':
      return { line: "L'utilisateur est une femme (parcours d'affirmation MTF).", subject: 'elle' };
    case 'FTM':
      return { line: "L'utilisateur est un homme (parcours d'affirmation FTM).", subject: 'il' };
  }
}

function formatKg(n: number): string {
  return n % 1 === 0 ? String(n) : String(n).replace(/\.?0+$/, '');
}

export function buildGoalDescriptionPromptText(opts: {
  profile: Profile | null;
  summary: PromptDashboardSummary | null | undefined;
  goalTitle: string;
  goalTargetKgStr?: string | null;
  goalTargetKg?: number | null;
  subGoalTitles?: string[];
}): string {
  const title = opts.goalTitle.trim() || '(titre non encore saisi - complète-le si besoin)';
  const targetFromStr = parseOptionalKg(opts.goalTargetKgStr);
  const targetKg = opts.goalTargetKg ?? targetFromStr;

  const heightCm = opts.summary?.heightCm ?? opts.profile?.heightCm ?? null;
  const weightKg = opts.summary?.currentWeight ?? opts.profile?.weightKg ?? null;
  const bmi = opts.summary?.bmi ?? null;

  const intro = opts.profile ? genderIntro(opts.profile.gender) : null;
  const s = intro?.subject ?? 'cette personne';

  const lines: string[] = [];
  const cap = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

  if (intro) {
    lines.push(intro.line);
    lines.push(
      `${cap(s)} utilise l'application Goals pour suivre son poids et ses objectifs : ${s} y enregistre des pesées et définit des objectifs dans l'app.`,
    );
  } else {
    lines.push(
      "L'utilisateur suit sa progression dans l'application Goals (suivi du poids et des objectifs). Les détails de genre du profil ne sont pas disponibles ici.",
    );
  }

  if (heightCm != null) {
    lines.push(`${cap(s)} mesure ${heightCm} cm.`);
  } else {
    lines.push(`La taille n'est pas renseignée dans le profil.`);
  }

  if (weightKg != null) {
    lines.push(`Le poids actuel enregistré dans l'app est de ${formatKg(weightKg)} kg.`);
  } else {
    lines.push(`Le poids actuel n'est pas disponible (ajoute une mesure ou complète le profil).`);
  }

  if (bmi != null && Number.isFinite(bmi)) {
    const category = getImcCategoryLabel(bmi);
    lines.push(
      category
        ? `L'IMC indicatif est d'environ ${formatKg(bmi)} (${category}).`
        : `L'IMC indicatif est d'environ ${formatKg(bmi)}.`,
    );
  }

  lines.push('');
  lines.push(`L'objectif pour lequel il faut une description s'intitule : « ${title} ».`);

  if (targetKg != null && Number.isFinite(targetKg)) {
    lines.push(`Le poids cible associé à cet objectif est ${formatKg(targetKg)} kg.`);
  } else {
    lines.push("Aucun poids cible n'est renseigné pour cet objectif (ou champ vide).");
  }

  if (opts.subGoalTitles && opts.subGoalTitles.length > 0) {
    lines.push('');
    lines.push("Sous-objectifs déjà listés dans l'app :");
    opts.subGoalTitles.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  }

  lines.push(
    '',
    '---',
    '',
    "Consigne pour l'IA : développe en 2 ou 3 phrases le champ « Description » de cet objectif. Reste direct, factuel et centré sur l'objectif ; aucun jugement, aucune moralisation, aucun ton paternaliste. Ne minimise pas l'objectif et n'ajoute pas d'avertissements superflus. Réponds uniquement avec le texte à coller, sans titre ni encadrement.",
  );

  return lines.join('\n');
}
