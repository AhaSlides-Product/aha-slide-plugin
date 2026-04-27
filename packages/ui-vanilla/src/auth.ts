const TOKEN_COOKIE_NAME = 'ahaToken';

/**
 * Reads the AhaSlides access token from the `ahaToken` cookie.
 *
 * The browser scopes `document.cookie` to the current document's domain, so the
 * cookie set on `localhost`, `.ahaslides.com`, or `.ahaslide.com` will be read
 * transparently — no explicit domain handling required here.
 *
 * @returns The token string, or `null` if the cookie is missing or unreadable
 * (e.g. running in a non-browser environment).
 */
export function getAccessToken(): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }

  const prefix = `${TOKEN_COOKIE_NAME}=`;
  const cookies = document.cookie.split(';');

  for (const raw of cookies) {
    const cookie = raw.trim();
    if (cookie.startsWith(prefix)) {
      const value = cookie.slice(prefix.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return null;
}
