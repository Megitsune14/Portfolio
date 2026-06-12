export interface VisitorGeo {
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
}

export interface VisitorClient {
  browser: string | null;
  os: string | null;
  deviceType: string | null;
}

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  CA: 'Canada',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
  DE: 'Allemagne',
  ES: 'Espagne',
  IT: 'Italie',
  NL: 'Pays-Bas',
  LU: 'Luxembourg',
};

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === 'unknown') return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) return true;
  return false;
}

export function countryCodeToName(code: string | null): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

export function parseUserAgent(userAgent: string): VisitorClient {
  if (!userAgent || userAgent === 'unknown') {
    return { browser: null, os: null, deviceType: null };
  }

  const ua = userAgent;

  let browser: string | null = null;
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  let os: string | null = null;
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  const deviceType =
    /Mobile|Android|iPhone|iPod/i.test(ua) && !/iPad/i.test(ua)
      ? 'mobile'
      : /iPad|Tablet/i.test(ua)
        ? 'tablet'
        : 'desktop';

  return { browser, os, deviceType };
}

export function geoFromCountryCode(countryCode: string | null): VisitorGeo {
  const code = countryCode?.trim().toUpperCase() || null;
  return {
    country: countryCodeToName(code),
    countryCode: code,
    city: null,
    region: null,
  };
}

export async function lookupGeoFromIp(
  ip: string,
  headerCountryCode?: string | null,
): Promise<VisitorGeo> {
  const fromHeader = geoFromCountryCode(headerCountryCode ?? null);
  if (fromHeader.countryCode) {
    return fromHeader;
  }

  if (isPrivateIp(ip)) {
    return { country: 'Local', countryCode: null, city: null, region: null };
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,regionName`,
      { signal: AbortSignal.timeout(3000) },
    );

    if (!response.ok) {
      return { country: null, countryCode: null, city: null, region: null };
    }

    const data = (await response.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      city?: string;
      regionName?: string;
    };

    if (data.status !== 'success') {
      return { country: null, countryCode: null, city: null, region: null };
    }

    return {
      country: data.country ?? countryCodeToName(data.countryCode ?? null),
      countryCode: data.countryCode ?? null,
      city: data.city ?? null,
      region: data.regionName ?? null,
    };
  } catch {
    return { country: null, countryCode: null, city: null, region: null };
  }
}

export function formatLocation(geo: Pick<VisitorGeo, 'city' | 'country' | 'countryCode'>): string {
  const country = geo.country ?? countryCodeToName(geo.countryCode);
  const parts = [geo.city, country].filter(Boolean);
  if (parts.length === 0) return '—';
  return parts.join(', ');
}

export function getCountryCodeFromHeaders(headers: {
  cfIpCountry?: string | null;
  xCountry?: string | null;
}): string | null {
  const code = headers.cfIpCountry?.trim() || headers.xCountry?.trim() || null;
  if (!code || code === 'XX' || code === 'T1') return null;
  return code.toUpperCase();
}
