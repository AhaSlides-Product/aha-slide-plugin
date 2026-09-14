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

Anything that calls `notifyDone()` will do. A **dedicated static page** is the
most robust choice:

```html
<!-- public/auth-popup.html -->
<p>Signing you in…</p>
<script>
  // Hard-coded duplicate of DEFAULT_CHANNEL / DONE_MESSAGE: a static page has
  // no bundler and cannot import them. Pin it with a test (see step 5).
  try {
    const channel = new BroadcastChannel('aha-auth');
    channel.postMessage({ type: 'aha-auth:done' });
    channel.close();
  } catch (error) {
    /* no channel — the opener's focus fallback still covers this */
  }
  window.close();
</script>
```

Point the callback at an application route instead and the popup must download
that bundle — and run whatever the entry point runs — before it can close. If
the bundle is ever slow or broken, the window never closes and the user is left
staring at it. A worker can serve the equivalent inline with no file at all.

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

### 5. Pin the duplicated constants

The callback page hard-codes the channel name and message. Add a test that
reads the file and asserts they match the package's exports, so the two cannot
drift:

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

Two independent signals, and no polling of `popup.closed` anywhere:

1. **`BroadcastChannel` ping** from the callback page — the fast path, and the
   only one that works while the opener already has focus.
2. **`focus` / `visibilitychange` on the opener** — the universal fallback.
   There is no close event on an opener, but closing a popup returns focus to
   whoever opened it, and *that* is an event.

Focus also fires when the user merely clicks back to the parent window, so it is
only conclusive alongside a closed popup. After a ping, a negative check is
*retried* (`maxChecks`, `retryDelayMs`) rather than believed — the session is
already in the jar, so `false` there means a slow identity endpoint. Once a ping
has arrived, focus can no longer settle the flow as `abandoned`; the ping's
retry sequence owns the outcome.

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
