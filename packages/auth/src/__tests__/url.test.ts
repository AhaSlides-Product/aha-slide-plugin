import { describe, expect, it } from 'vitest';
import { resolveLoginUrl, resolveSameOrigin } from '../url.js';

describe('resolveSameOrigin', () => {
  it('resolves a rooted path against the current origin', () => {
    expect(resolveSameOrigin('/auth-popup.html')).toBe(`${location.origin}/auth-popup.html`);
  });

  it('preserves an existing query string', () => {
    expect(resolveSameOrigin('/auth/login?next=/studio')).toBe(
      `${location.origin}/auth/login?next=/studio`,
    );
  });

  // The whole design rests on the popup terminating on the opener's origin.
  // Each of these looks rooted but leaves it.
  it.each([
    ['protocol-relative', '//evil.example'],
    ['backslash authority', '/\\evil.example'],
    ['absolute url', 'https://evil.example/cb'],
    ['scheme-only', 'javascript:alert(1)'],
    ['unrooted', 'auth-popup.html'],
    ['empty', ''],
  ])('refuses %s', (_label, value) => {
    expect(() => resolveSameOrigin(value)).toThrow();
  });
});

describe('resolveLoginUrl', () => {
  it('allows an absolute https url, since the login page is off-origin', () => {
    expect(resolveLoginUrl('https://presenter.example.com/pages/login?redirect=x')).toBe(
      'https://presenter.example.com/pages/login?redirect=x',
    );
  });

  it('allows http for local development', () => {
    expect(resolveLoginUrl('http://localhost:3000/pages/login')).toBe(
      'http://localhost:3000/pages/login',
    );
  });

  it('resolves a path against the current origin', () => {
    expect(resolveLoginUrl('/auth/login?next=/')).toBe(`${location.origin}/auth/login?next=/`);
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>', 'not a url'])(
    'refuses %s',
    (value) => {
      expect(() => resolveLoginUrl(value)).toThrow();
    },
  );
});
