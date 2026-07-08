import { z } from 'zod';
import { localizedStringSchema, optionalLocalizedStringSchema } from '../../shared/i18n/localized.js';

export const projectLinkSchema = z.object({
  label: localizedStringSchema(40),
  url: z.string().url(),
});

const assetPathSchema = z
  .string()
  .max(300)
  .regex(/^\/assets\/(projects|social)\/[^/]+$/, 'Le chemin doit être /assets/projects/... ou /assets/social/...');

export const projectSchema = z.object({
  title: localizedStringSchema(120),
  description: localizedStringSchema(500),
  techStack: localizedStringSchema(500),
  url: z.string().url().optional().or(z.literal('')),
  links: z.array(projectLinkSchema).max(6).optional(),
  imageUrl: assetPathSchema.optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export const projectUpdateSchema = projectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ à modifier' },
);

export const socialLinkSchema = z.object({
  name: localizedStringSchema(80),
  username: optionalLocalizedStringSchema(120),
  url: z.string().url().optional().or(z.literal('')),
  icon: assetPathSchema.optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export const socialLinkUpdateSchema = socialLinkSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ à modifier' },
);

export type ProjectLink = z.infer<typeof projectLinkSchema>;
