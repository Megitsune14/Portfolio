import { z } from 'zod';

export type LocalizedString = { en: string; fr: string };

export type LocalizedStringOptional = { en?: string; fr?: string };

export function localizedStringSchema(max: number) {
  return z.object({
    en: z.string().min(1).max(max),
    fr: z.string().min(1).max(max),
  });
}

export function optionalLocalizedStringSchema(max: number) {
  return z
    .object({
      en: z.string().max(max).optional(),
      fr: z.string().max(max).optional(),
    })
    .optional();
}

export function normalizeLocalizedString(value: unknown): LocalizedString {
  if (value && typeof value === 'object' && 'en' in value && 'fr' in value) {
    const record = value as Record<string, unknown>;
    return {
      en: String(record.en ?? ''),
      fr: String(record.fr ?? ''),
    };
  }

  if (typeof value === 'string') {
    return { en: value, fr: value };
  }

  return { en: '', fr: '' };
}

export function normalizeOptionalLocalizedString(value: unknown): LocalizedStringOptional | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value ? { en: value, fr: value } : undefined;
  }

  if (typeof value === 'object' && ('en' in value || 'fr' in value)) {
    const record = value as Record<string, unknown>;
    const en = record.en !== undefined && record.en !== '' ? String(record.en) : undefined;
    const fr = record.fr !== undefined && record.fr !== '' ? String(record.fr) : undefined;
    if (!en && !fr) {
      return undefined;
    }
    return { en, fr };
  }

  return undefined;
}
