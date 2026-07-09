import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  decodeSessionTokenPayload,
  verifySessionToken,
} from '../src/modules/nexus/auth/auth.service.js';
import { parseWrappedQuery } from '../src/modules/spotify/schemas/wrapped.schemas.js';
import { yearBounds } from '../src/modules/spotify/data/play.repository.js';
import { moodResponseSchema } from '../src/modules/spotify/mood/mood.schema.js';

process.env.SESSION_SECRET = 'test-session-secret-for-unit-tests';

describe('NexusAuthService', () => {
  it('verifySessionToken accepts a freshly created token', () => {
    const token = createSessionToken();
    assert.equal(verifySessionToken(token), true);
  });

  it('verifySessionToken rejects tampered tokens', () => {
    const token = createSessionToken();
    assert.equal(verifySessionToken(`${token}x`), false);
  });

  it('session token expires in approximately 14 days', () => {
    const token = createSessionToken();
    const payload = decodeSessionTokenPayload(token);
    assert.ok(payload);
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const delta = payload.exp - payload.iat;
    assert.ok(Math.abs(delta - fourteenDaysMs) < 1000);
  });
});

describe('parseWrappedQuery', () => {
  it('returns all-time for /all-time paths', () => {
    const result = parseWrappedQuery({
      req: { path: '/nexus/spotify/wrapped/all-time', query: () => undefined },
    } as never);
    assert.deepEqual(result, { period: 'all-time' });
  });

  it('returns year period from year query param', () => {
    const result = parseWrappedQuery({
      req: {
        path: '/nexus/spotify/wrapped',
        query: (key: string) => (key === 'year' ? '2024' : undefined),
      },
    } as never);
    assert.deepEqual(result, { period: 'year', year: 2024 });
  });
});

describe('yearBounds', () => {
  it('returns UTC year boundaries', () => {
    const { from, to } = yearBounds(2024);
    assert.equal(from.toISOString(), '2024-01-01T00:00:00.000Z');
    assert.equal(to.toISOString(), '2025-01-01T00:00:00.000Z');
  });
});

describe('moodResponseSchema', () => {
  it('accepts moods between 3 and 10 words', () => {
    const result = moodResponseSchema.parse({ mood: 'mélancolique nocturne douce' });
    assert.equal(result.mood, 'mélancolique nocturne douce');
  });

  it('rejects moods outside the word range', () => {
    assert.throws(() => moodResponseSchema.parse({ mood: 'trop court' }));
    assert.throws(() =>
      moodResponseSchema.parse({
        mood: 'un deux trois quatre cinq six sept huit neuf dix onze',
      }),
    );
  });
});
