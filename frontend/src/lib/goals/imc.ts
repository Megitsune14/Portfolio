export type ImcCategoryId =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obesity-moderate'
  | 'obesity-severe'
  | 'obesity-morbid'

export interface ImcCategory {
  id: ImcCategoryId
  label: string
}

/** Catégories OMS (mêmes seuils que le BMI). */
export function getImcCategory(bmi: number): ImcCategory {
  if (bmi < 18.5) return { id: 'underweight', label: 'Insuffisance pondérale' }
  if (bmi < 25) return { id: 'normal', label: 'Corpulence normale' }
  if (bmi < 30) return { id: 'overweight', label: 'Surpoids' }
  if (bmi < 35) return { id: 'obesity-moderate', label: 'Obésité modérée' }
  if (bmi < 40) return { id: 'obesity-severe', label: 'Obésité sévère' }
  return { id: 'obesity-morbid', label: 'Obésité morbide' }
}

export function getImcCategoryLabel(bmi: number | null | undefined): string | null {
  if (bmi == null || !Number.isFinite(bmi)) return null
  return getImcCategory(bmi).label
}

export function formatImcValue(bmi: number | null | undefined): string {
  if (bmi == null || !Number.isFinite(bmi)) return '-'
  return String(bmi)
}
