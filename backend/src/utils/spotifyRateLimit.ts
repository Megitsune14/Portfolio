function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as {
    statusCode?: number;
    headers?: Record<string, string | string[] | undefined>;
    body?: { retry_after?: number };
  };

  if (err.statusCode !== 429) return null;

  const header = err.headers?.['retry-after'];
  const retryAfterHeader = Array.isArray(header) ? header[0] : header;
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!Number.isNaN(seconds)) return seconds * 1000;
  }

  if (typeof err.body?.retry_after === 'number') {
    return err.body.retry_after * 1000;
  }

  return null;
}

export function isSpotifyRateLimitError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    (error as { statusCode?: number }).statusCode === 429
  );
}

export async function spotifyCall<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!isSpotifyRateLimitError(error) || attempt >= maxRetries) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error) ?? 1000 * (attempt + 1);
      await sleep(retryAfterMs);
      attempt++;
    }
  }
}

export async function delayBetweenBatches(ms: number): Promise<void> {
  if (ms <= 0) return;
  await sleep(ms);
}
