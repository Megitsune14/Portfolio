import { z } from 'zod';

export const genderSchema = z.enum(['Homme', 'Femme', 'MTF', 'FTM']);

export const profileSchema = z.object({
  gender: genderSchema,
  weightKg: z.number().min(30).max(350),
  heightCm: z.number().min(100).max(250),
  targetWeightKg: z.number().min(30).max(350).optional(),
});

export const weightEntrySchema = z.object({
  weightKg: z.number().min(30).max(350),
  note: z.string().max(400).optional(),
  measuredAt: z.string().datetime().optional(),
});

export const weightEntryUpdateSchema = z
  .object({
    weightKg: z.number().min(30).max(350).optional(),
    note: z.string().max(400).optional(),
    measuredAt: z.string().datetime().optional(),
  })
  .refine((d) => d.weightKg !== undefined || d.note !== undefined || d.measuredAt !== undefined, {
    message: 'Au moins un champ à modifier',
  });

export const goalSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(400).optional(),
  targetWeightKg: z.number().min(30).max(350).optional(),
  status: z.enum(['active', 'completed']).optional(),
});

export const subGoalCreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(400).optional(),
});

export const subGoalUpdateSchema = z
  .object({
    title: z.string().min(2).max(120).optional(),
    description: z.string().max(400).optional(),
    status: z.enum(['active', 'completed']).optional(),
  })
  .refine((d) => d.title !== undefined || d.description !== undefined || d.status !== undefined, {
    message: 'Au moins un champ à modifier',
  });
