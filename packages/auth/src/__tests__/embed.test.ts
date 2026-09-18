// The contract half: which URL we frame, and which messages count. These are
// the two things that keep an embedded login from becoming a way in.
import { describe, expect, it } from 'vitest';
import { AUTH_EMBED_EVENT, AUTH_EMBED_SOURCE } from '../constants.js';
import { authEmbedOrigin, authEmbedUrl, readAuthEmbedMessage } from '../embed.js';

const AUTH = 'https://presenter.ahaslides.com';
const HOST = 'https://elearning.ahaslides.com';

describe('authEmbedUrl', () => {
  it('frames the login form on the auth origin and names the host', () => {
    const url = new URL(authEmbedUrl(AUTH, { hostOrigin: HOST }));

    expect(url.origin).toBe(AUTH);
    expect(url.pathname).toBe('/authen/embed/login');
    expect(url.searchParams.get('origin')).toBe(HOST);
    // Defaults are not spelled out: the page dims and draws its own ✕.
    expect(url.searchParams.get('dim')).toBeNull();
    expect(url.searchParams.get('closable')).toBeNull();
  });

  it('frames signup on request', () => {
    expect(new URL(authEmbedUrl(AUTH, { signup: true })).pathname).toBe('/authen/embed/signup');
  });

  it('sends only the non-default chrome flags, plus any carried query', () => {
    const url = new URL(
      authEmbedUrl(AUTH, { dim: false, closable: false, query: { refby: 'elearning' } }),
    );

    expect(url.searchParams.get('dim')).toBe('0');
    expect(url.searchParams.get('closable')).toBe('0');
    expect(url.searchParams.get('refby')).toBe('elearning');
  });

  // The auth app is always at /authen/* on whatever host serves it, so a base
  // carrying a path of its own contributes nothing but its origin.
  it('ignores a path on the base', () => {
    expect(new URL(authEmbedUrl(`${AUTH}/elearning/`)).pathname).toBe('/authen/embed/login');
  });

  describe('redirectUri', () => {
    const AUTHORIZE = 'https://presenter.ahaslides.com/api/auth/oauth/authorize?client_id=x';

    it('sends it as redirect_uri, which is what switches the embed to popup mode', () => {
      const url = new URL(authEmbedUrl(AUTH, { redirectUri: AUTHORIZE }));
      expect(url.searchParams.get('redirect_uri')).toBe(AUTHORIZE);
    });

    it('is absent unless asked for', () => {
      expect(new URL(authEmbedUrl(AUTH)).searchParams.get('redirect_uri')).toBeNull();
    });

    // The auth app re-validates and treats anything it rejects as ABSENT, which
    // silently restores the ordinary password flow. A caller who fat-fingers the
    // value would see the mode switch do nothing and have nothing to go on.
    it('refuses a value the auth app would silently discard', () => {
      expect(() => authEmbedUrl(AUTH, { redirectUri: 'javascript:alert(1)' }))
        .toThrow(/refusing javascript: redirectUri/);
      expect(() => authEmbedUrl(AUTH, { redirectUri: '/api/auth/oauth/authorize' }))
        .toThrow(/is not an absolute url/);
      expect(() => authEmbedUrl(AUTH, { redirectUri: '' })).toThrow(/must not be empty/);
    });

    // The error has to name the thing the caller got wrong: these two are
    // rejected by different rules and only one of them becomes an iframe src.
    it('does not report a bad redirect as a bad auth app url', () => {
      expect(() => authEmbedUrl(AUTH, { redirectUri: 'ftp://x.example' }))
        .toThrow(/redirectUri/);
      expect(() => authEmbedUrl('ftp://x.example')).toThrow(/auth app url/);
    });
  });

  it('defaults the host origin to this document', () => {
    expect(new URL(authEmbedUrl(AUTH)).searchParams.get('origin')).toBe(window.location.origin);
  });

  // The result becomes an iframe src, which executes in the HOST document.
  // `new URL('javascript:…')` parses fine and reports origin "null", so this
  // check is the only thing standing between a bad config and script execution.
  it('refuses a base that is not http(s)', () => {
    expect(() => authEmbedUrl('javascript:alert(1)')).toThrow(/refusing javascript:/);
    expect(() => authEmbedOrigin('javascript:alert(1)')).toThrow(/refusing javascript:/);
    expect(() => authEmbedUrl('data:text/html,<script>')).toThrow(/refusing data:/);
    expect(() => authEmbedUrl('/authen')).toThrow(/not a valid absolute url/);
    expect(() => authEmbedUrl('')).toThrow(/base url is required/);
  });

  it('reads the origin off the base', () => {
    expect(authEmbedOrigin(`${AUTH}/authen/`)).toBe(AUTH);
  });
});

describe('readAuthEmbedMessage', () => {
  const ready = { source: AUTH_EMBED_SOURCE, type: AUTH_EMBED_EVENT.ready };

  it('accepts a well-formed message from the auth origin', () => {
    expect(readAuthEmbedMessage({ origin: AUTH, data: ready }, AUTH)).toEqual({
      type: AUTH_EMBED_EVENT.ready,
    });
  });

  it('carries the advisory user through on success', () => {
    const message = readAuthEmbedMessage(
      {
        origin: AUTH,
        data: {
          source: AUTH_EMBED_SOURCE,
          type: AUTH_EMBED_EVENT.success,
          user: { id: 7, email: 'a@b.com', token: 'SECRET' },
        },
      },
      AUTH,
    );

    expect(message?.user?.email).toBe('a@b.com');
    // Only the named fields are copied, so a field the sender adds later
    // cannot ride along into a host that was not expecting it.
    expect(message?.user).not.toHaveProperty('token');
  });

  // The whole point of the origin check: any page can postMessage a
  // perfectly-shaped success, and acting on one hands it whatever the host
  // does on sign-in.
  it('rejects the same message from any other origin', () => {
    expect(readAuthEmbedMessage({ origin: 'https://evil.example', data: ready }, AUTH)).toBeNull();
    // A sub-domain of the auth host is still a different origin…
    expect(readAuthEmbedMessage({ origin: 'https://x.ahaslides.com', data: ready }, AUTH)).toBeNull();
    // …and so is the same host over http.
    expect(readAuthEmbedMessage({ origin: 'http://presenter.ahaslides.com', data: ready }, AUTH))
      .toBeNull();
    // An empty expectation must never match an empty origin (file://, sandbox).
    expect(readAuthEmbedMessage({ origin: '', data: ready }, '')).toBeNull();
  });

  describe('consent', () => {
    it('carries the decision through', () => {
      for (const granted of [true, false]) {
        expect(
          readAuthEmbedMessage(
            {
              origin: AUTH,
              data: { source: AUTH_EMBED_SOURCE, type: AUTH_EMBED_EVENT.consent, granted },
            },
            AUTH,
          ),
        ).toEqual({ type: AUTH_EMBED_EVENT.consent, granted });
      }
    });

    // `granted` IS the user's answer. Defaulting a missing one either invents a
    // refusal nobody made or authorises a client on their behalf, so the message
    // is dropped instead.
    it('drops a consent that carries no decision', () => {
      for (const granted of [undefined, null, 'true', 1]) {
        expect(
          readAuthEmbedMessage(
            {
              origin: AUTH,
              data: { source: AUTH_EMBED_SOURCE, type: AUTH_EMBED_EVENT.consent, granted },
            },
            AUTH,
          ),
        ).toBeNull();
      }
    });

      it('is still subject to the origin check ', () => {
      expect(
        readAuthEmbedMessage(
          {
            origin: 'https://evil.example',
            data: { source: AUTH_EMBED_SOURCE, type: AUTH_EMBED_EVENT.consent, granted: true },
          },
          AUTH,
        ),
      ).toBeNull();
    });
  });

  describe('abandoned', () => {
    const abandon = (reason: unknown) => ({
      source: AUTH_EMBED_SOURCE,
      type: AUTH_EMBED_EVENT.abandoned,
      reason,
    });

    it('carries the reason through', () => {
      for (const reason of ['closed', 'timeout']) {
        expect(readAuthEmbedMessage({ origin: AUTH, data: abandon(reason) }, AUTH)).toEqual({
          type: AUTH_EMBED_EVENT.abandoned,
          reason,
        });
      }
    });

    // Same rule as `granted`: the payload is the information, so an
    // unrecognised reason is dropped rather than guessed at.
    it('drops an abandon with no reason it recognises', () => {
      for (const reason of [undefined, null, '', 'blocked', 1]) {
        expect(readAuthEmbedMessage({ origin: AUTH, data: abandon(reason) }, AUTH)).toBeNull();
      }
    });
  });

  it('ignores traffic that is not ours', () => {
    expect(readAuthEmbedMessage({ origin: AUTH, data: null }, AUTH)).toBeNull();
    expect(readAuthEmbedMessage({ origin: AUTH, data: 'ping' }, AUTH)).toBeNull();
    expect(readAuthEmbedMessage({ origin: AUTH, data: { type: ready.type } }, AUTH)).toBeNull();
    expect(readAuthEmbedMessage({ origin: AUTH, data: { source: 'zoid', type: 'init' } }, AUTH))
      .toBeNull();
    expect(
      readAuthEmbedMessage({ origin: AUTH, data: { source: AUTH_EMBED_SOURCE, type: 'nope' } }, AUTH),
    ).toBeNull();
  });
});
