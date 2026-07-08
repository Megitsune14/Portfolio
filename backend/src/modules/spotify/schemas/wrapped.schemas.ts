import type { Context } from 'hono';

export type WrappedPeriodQuery =
  | { period: 'all-time' }
  | { period: 'year'; year: number }
  | { period: 'month'; year: number; month: number | 'current' };

export function parseWrappedQuery(c: Context): WrappedPeriodQuery | { error: string } {
  const allTime = c.req.path.endsWith('/all-time') || c.req.query('period') === 'all-time';

  if (allTime) {
    return { period: 'all-time' };
  }

  const period = c.req.query('period');
  const yearParam = c.req.query('year');
  const monthParam = c.req.query('month');

  if (period === 'month' && yearParam) {
    const year = parseInt(yearParam, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return { error: 'Année invalide' };
    }

    if (monthParam === 'current') {
      return { period: 'month', year, month: 'current' };
    }

    if (monthParam) {
      const month = parseInt(monthParam, 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        return { error: 'Mois invalide' };
      }
      return { period: 'month', year, month };
    }

    return { period: 'year', year };
  }

  if (period === 'year' && yearParam) {
    const year = parseInt(yearParam, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return { error: 'Année invalide' };
    }
    return { period: 'year', year };
  }

  if (yearParam) {
    const year = parseInt(yearParam, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return { error: 'Année invalide' };
    }
    return { period: 'year', year };
  }

  return { period: 'year', year: new Date().getFullYear() };
}
