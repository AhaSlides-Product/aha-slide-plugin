import { DEFAULT_CHANNEL, DONE_MESSAGE } from './constants.js';
import type { CallbackPageOptions } from './types.js';

const DEFAULT_PENDING_TEXT = 'Signing you in…';
const DEFAULT_SETTLED_TEXT = 'You are signed in. You can close this window.';
const MESSAGE_ELEMENT_ID = 'aha-auth-popup-message';

/** Embed a value as a JS literal. `JSON.stringify` also escapes the `<` in a
 *  hostile `</script>` sequence once the result is spliced into a page. */
function literal(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * The script the callback page runs — ping, then close.
 *
 * Provided as source rather than left to each consumer because it is not the
 * two constants that are easy to get wrong, it is the four decisions around
 * them: guarding `BroadcastChannel` (absent in older Safari and hardened
 * contexts), closing the channel only AFTER `postMessage` has queued delivery,
 * tolerating a `window.close()` that the browser refuses, and saying something
 * useful when there is no opener to return to.
 *
 * Use this when you already own the page and only want the behaviour. Use
 * {@link callbackPageHtml} when you want the whole document.
 *
 * Plain ES5, no bundler, no imports — it has to run in a `public/` file or a
 * worker-generated response.
 */
export function callbackScript(options: CallbackPageOptions = {}): string {
  const { channelName = DEFAULT_CHANNEL, settledText = DEFAULT_SETTLED_TEXT } = options;
  return `(function () {
  'use strict';
  // The ping carries no payload: the session is already in a cookie on this
  // origin, so there is nothing to hand over, and a message with no secret in
  // it cannot leak one.
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      var channel = new BroadcastChannel(${literal(channelName)});
      channel.postMessage({ type: ${literal(DONE_MESSAGE)} });
      // postMessage has already queued delivery on every other channel object,
      // so closing straight away is safe.
      channel.close();
    }
  } catch (error) {
    // No channel. Closing below still returns focus to the opener, which is
    // the universal signal.
  }

  try {
    window.close();
  } catch (error) {
    // Not script-closable.
  }

  // Still here a moment later means there was no opener — a bookmarked URL, or
  // a popup blocker that sent the whole page here. Nothing to close, and no
  // redirect target we could trust, so just say so.
  setTimeout(function () {
    var element = document.getElementById(${literal(MESSAGE_ELEMENT_ID)});
    if (element) {
      element.textContent = ${literal(settledText)};
    }
  }, 500);
})();`;
}

/**
 * A complete, dependency-free callback page.
 *
 * Serve it straight from a worker, or write it to a static file at build time —
 * `public/` is copied verbatim by most bundlers, so a page there cannot import
 * this module and would otherwise hand-roll {@link callbackScript}.
 *
 * Deliberately unstyled beyond centring: it exists for a few hundred
 * milliseconds inside a window that is closing. A consumer who wants branding
 * should write their own page and call {@link callbackScript} instead.
 */
export function callbackPageHtml(options: CallbackPageOptions = {}): string {
  const {
    title = 'Signing you in…',
    pendingText = DEFAULT_PENDING_TEXT,
    lang = 'en',
  } = options;
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        font-size: 1rem;
        text-align: center;
        padding: 1.5rem;
      }
      p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <p id="${MESSAGE_ELEMENT_ID}">${pendingText}</p>
    <script>
${callbackScript(options)
  .split('\n')
  .map((line) => (line ? `      ${line}` : line))
  .join('\n')}
    </script>
  </body>
</html>
`;
}
