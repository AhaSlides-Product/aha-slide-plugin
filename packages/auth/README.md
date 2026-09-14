# @aha/auth

Popup sign-in for AhaSlides apps that delegate login to the platform but do not
want a full-page redirect. Published as `@ahaslides-product/plugins-auth`.

Extracted from aha-elearning's learner sign-in gate after the design was proven
there.

## What it is, and what it deliberately is not

A **window-and-signal orchestrator**, not an auth library. It opens a window,
learns when that window finished, and asks the host app to re-check identity. It
never sees a password, a token or a cookie, and the single message it sends
carries no payload. Adopting it adds nothing to an application's
security-critical surface — which is the point, and worth preserving.

It cannot log anyone in by itself. That is a property of the platform rather
than a gap here: login is only reachable as a server-rendered page, the OAuth
code exchange needs a client secret that can never reach a browser, and
federated providers refuse to render inside an iframe. A real top-level
navigation has to happen. All that is left to design is **where it lands** and
**how the opener finds out** — which is this package.

## The one invariant

**The popup must terminate on the origin that opened it.** That origin is the
only one whose cookie the opener can see, and the only one a same-origin
`BroadcastChannel` reaches. No credential ever crosses a window boundary,
because none needs to: by the time the popup closes, the session cookie is
already set on the opener's own origin.

`resolveSameOrigin()` enforces this by taking a **path**, not a URL, and
throwing on `//evil`, `/\evil`, absolutes and non-http schemes. An app served
from two hosts gets the right answer for free; a hardcoded absolute URL would
set a host-only cookie on the wrong host and leave the opener waiting forever.

## Integrating it — five steps

### 1. Install

```bash
npm install @ahaslides-product/plugins-auth
```

### 2. Serve a callback page on your own origin

The package generates the page, so nothing needs hand-rolling. What is easy to
get wrong is not the channel name — it is the four decisions around it:
guarding `BroadcastChannel` (absent in older Safari and hardened contexts),
closing the channel only *after* `postMessage` has queued delivery, tolerating
a `window.close()` the browser refuses, and saying something useful when there
is no opener to return to.

**From a worker or any server** — return it directly:

```ts
import { callbackPageHtml } from '@ahaslides-product/plugins-auth';

return new Response(callbackPageHtml(), {
  headers: { 'content-type': 'text/html; charset=utf-8' },
});
```

**From a static-site build** — `public/` is copied verbatim by most bundlers, so
a page there cannot import this module. Generate it instead, and commit the
output so `vite dev` needs no build step:

```js
// scripts/write-auth-popup.mjs   (run from prebuild)
import { writeFileSync } from 'node:fs';
import { callbackPageHtml } from '@ahaslides-product/plugins-auth';

writeFileSync('public/auth-popup.html', callbackPageHtml());
```

Then pin the committed file with a test, the same generate-and-verify shape as
any other generated artifact:

```ts
expect(readFileSync('public/auth-popup.html', 'utf8')).toBe(callbackPageHtml());
```

**If you want your own branding**, write the page yourself and embed just the
behaviour:

```ts
import { callbackScript } from '@ahaslides-product/plugins-auth';
// ...
`<script>${callbackScript()}</script>`
```

`callbackScript()` is plain ES5 with no imports, so it runs in a `public/` file
or a worker-generated response. Both take `channelName`, `title`, `pendingText`,
`settledText` and `lang`; every option is escaped for embedding.

**Why a dedicated page rather than an app route.** Point the callback at an
application route and the popup must download that bundle — and run whatever the
entry point runs — before it can close. If the bundle is ever slow or broken,
the window never closes and the user is left staring at it. The generated page
has almost nothing that can fail.

### 3. Open the popup from the click handler

Call `signIn` **synchronously** — an `await` before it loses the user gesture
and the popup blocker eats the window.

```ts
import { signIn, resolveSameOrigin } from '@ahaslides-product/plugins-auth';

function onSignInClick(event: MouseEvent) {
  event.preventDefault();

  const login = new URL('/pages/login', PRESENTER_APP_URL);
  login.searchParams.set('redirect', resolveSameOrigin('/auth-popup.html'));

  void signIn({
    url: login.toString(),
    onDone: recheckIdentity,
    onBlocked: () => location.assign(fullPageLoginUrl),
  }).then(({ status }) => {
    // 'authenticated' needs nothing here — your gate re-renders off step 4.
    // 'abandoned' is the user's choice; leave it alone.
    if (status === 'unresolved') location.assign(fullPageLoginUrl);
  });
}
```

Keep the button a real `<a href>` pointing at the full-page login and
`preventDefault()` in the handler. Middle-click, "open in new tab" and a
JS-less load then all still work, and you have the popup-blocked fallback
already written.

### 4. Make your identity state reactive — the step everyone misses

`onDone` must **re-check identity and report the answer**, never assume success:

```ts
async function recheckIdentity(): Promise<boolean> {
  notifySessionChanged();          // see below
  if (!isSignedIn()) return false; // reads the cookie fresh
  await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  return true;
}
```

**A cookie appearing fires no event of any kind.** If your "am I signed in?"
state is computed by reading `document.cookie` during render — which is the
normal shape — then nothing re-renders when the popup completes, and the gate
sits there over a session that already exists. This package cannot fix that for
you; it lives in your state layer.

aha-elearning solves it with a counter and `useSyncExternalStore`:

```ts
const listeners = new Set<() => void>();
let revision = 0;

export function notifySessionChanged(): void {
  revision += 1;
  for (const listener of listeners) listener();
}

export function useSessionRevision(): number {
  return useSyncExternalStore(
    (listener) => (listeners.add(listener), () => listeners.delete(listener)),
    () => revision,
    () => revision,
  );
}
```

The signal carries **no data** on purpose: subscribers re-read the cookies
themselves, so it can never disagree with the jar it is announcing. Subscribe
in the hook that decides the gate — and subscribe there *directly*. On a
hardened cookie jar the readable token is `undefined` both before and after
sign-in, so a hook whose state is derived from the token never changes and
re-renders nothing.

### 5. Pin the page, if you hand-wrote it

Generated pages are pinned by the equality check in step 2 and need nothing
further. If you wrote your own page and copied the script by hand, assert that
the constants still match so the two cannot drift:

```ts
import { DEFAULT_CHANNEL, DONE_MESSAGE } from '@ahaslides-product/plugins-auth';

const html = readFileSync(resolve(__dirname, '../../public/auth-popup.html'), 'utf8');
expect(html).toContain(`'${DEFAULT_CHANNEL}'`);
expect(html).toContain(`'${DONE_MESSAGE}'`);
```

## Outcomes

| `status` | Meaning | What to do |
| --- | --- | --- |
| `authenticated` | `onDone()` reported a session. The only success. | Nothing — your reactive state closes the gate. |
| `abandoned` | Popup closed, still no session. | Nothing. The user chose this. |
| `blocked` | `window.open` returned nothing. | Already handled by `onBlocked`. |
| `unresolved` | Completion was signalled but `onDone()` never confirmed. | A real fault — recover via the full-page login. |
| `timeout` | Nothing happened within `timeoutMs` (default 10 min). | Leave the gate up; the user can click again. |
| `cancelled` | `cancelSignIn()` was called, e.g. on unmount. | Nothing. |

Call `cancelSignIn()` on teardown so listeners and timers cannot outlive the
component that started them.

## How completion is detected

Two independent signals, and no polling of `popup.closed` anywhere. They answer
**different questions**, which is why both are needed:

1. **`focus` / `visibilitychange` on the opener** — tells you the popup went
   *away*. There is no close event on an opener, but closing a popup returns
   focus to whoever opened it, and *that* is an event. Focus also fires when the
   user merely clicks back to the parent window, so it is only conclusive
   alongside a closed popup.
2. **`BroadcastChannel` ping** from the callback page — tells you it went away
   because it *succeeded*. Focus can never distinguish that from the user giving
   up, because both look identical from the opener.

That second distinction is what makes the retries safe. After a ping, a negative
check means a slow identity endpoint rather than a failed login, so it is worth
asking again (`maxChecks`, `retryDelayMs`) — and once a ping has arrived, focus
can no longer settle the flow as `abandoned` at all; the retry sequence owns the
outcome.

### If `BroadcastChannel` is unavailable

The flow still completes — old Safari and hardened contexts fall back to focus
alone, and a login whose identity check answers promptly resolves as
`authenticated` exactly as usual.

What is lost is the retry safety net. With no ping there is nothing asserting
success, so a real login whose identity check is momentarily slow settles as
**`abandoned`**: the gate stays up over a session that exists. This is measured,
not theoretical — `src/__tests__/signIn.test.ts` pins the behaviour so nobody
mistakes the channel for decoration. If your consumers include browsers without
it, make `onDone` cheap (read a cookie, do not await a network round trip).

## Contract between apps

Two apps interoperate if they agree on exactly two things: the **channel name**
(`aha-auth`) and the **message shape** (`{ type: 'aha-auth:done' }`). Everything
else — how the login URL is built, which query parameter carries the callback,
what "signed in" means — stays private to each app.

## Constraints worth knowing

- **Do not add `Cross-Origin-Opener-Policy: same-origin`** to the auth routes or
  the opener. It severs `window.opener`, and the handle is how an abandoned
  popup is told from an open one. The code degrades rather than breaking (an
  unreadable `closed` is treated as "still open"), but the `abandoned` outcome
  stops working.
- `noopener` is deliberately **not** set on `window.open`, for the same reason.
  The popup only ever navigates to our own login origin.
- Mobile Safari opens a tab rather than a popup. The focus signal still fires
  when the user returns, so the flow completes — it just looks like a tab
  switch.
- Relative imports in `src/` carry `.js` extensions. Node ESM cannot resolve
  extensionless ones; bundlers can, which is exactly what hides the problem
  until a non-bundler consumer installs the package.

## Development

```bash
npm run build     -w @aha/auth   # tsconfig.build.json — excludes tests from dist
npm run typecheck -w @aha/auth   # tsconfig.json — INCLUDES tests
npm run test      -w @aha/auth   # typecheck, then vitest
```
