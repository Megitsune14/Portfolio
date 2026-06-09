import { z } from 'zod';

export const newGoalWithTargetSchema = z
  .object({
    title: z.string().min(3).max(120),
    description: z.string().max(400).optional(),
    targetWeightKg: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const t = d.targetWeightKg?.trim();
    if (!t) return;
    const n = Number(t.replace(',', '.'));
    if (!Number.isFinite(n) || n < 30 || n > 350) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetWeightKg'],
        message: 'Entre 30 et 350 kg, ou laisse vide',
      });
    }
  });

export const goalEditFormSchema = z
  .object({
    title: z.string().min(3).max(120),
    description: z.string().max(400).optional(),
    status: z.enum(['active', 'completed']),
    targetWeightKg: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const t = d.targetWeightKg?.trim();
    if (!t) return;
    const n = Number(t.replace(',', '.'));
    if (!Number.isFinite(n) || n < 30 || n > 350) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetWeightKg'],
        message: 'Entre 30 et 350 kg, ou laisse vide',
      });
    }
  });

export const subGoalFormSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(400).optional(),
});

export const profileEditFormSchema = z
  .object({
    gender: z.enum(['Homme', 'Femme', 'MTF', 'FTM']),
    heightCm: z.string().min(1, 'Taille requise'),
    weightKg: z.string().min(1, 'Poids requis'),
    targetWeightKg: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const height = Number(d.heightCm.replace(',', '.'));
    if (!Number.isFinite(height) || height < 100 || height > 250) {
      ctx.addIssue({ code: 'custom', path: ['heightCm'], message: 'Entre 100 et 250 cm' });
    }
    const weight = Number(d.weightKg.replace(',', '.'));
    if (!Number.isFinite(weight) || weight < 30 || weight > 350) {
      ctx.addIssue({ code: 'custom', path: ['weightKg'], message: 'Entre 30 et 350 kg' });
    }
    const target = d.targetWeightKg?.trim();
    if (target) {
      const n = Number(target.replace(',', '.'));
      if (!Number.isFinite(n) || n < 30 || n > 350) {
        ctx.addIssue({ code: 'custom', path: ['targetWeightKg'], message: 'Entre 30 et 350 kg, ou laisse vide' });
      }
    }
  });

export const onboardingFormSchema = profileEditFormSchema;

export const weightCreateFormSchema = z.object({
  weightKg: z
    .string()
    .min(1, 'Indique un poids')
    .transform((s) => Number(String(s).replace(',', '.')))
    .pipe(z.number().min(30).max(350)),
  note: z.string().max(400).optional(),
  measuredAt: z.string().optional(),
});

export const weightEditFormSchema = z.object({
  weightKg: z
    .string()
    .min(1, 'Indique un poids')
    .transform((s) => Number(String(s).replace(',', '.')))
    .pipe(z.number().min(30).max(350)),
  note: z.string().max(400).optional(),
  measuredAt: z.string().optional(),
});
