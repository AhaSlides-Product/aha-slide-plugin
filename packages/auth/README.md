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

## Opener side

Call `signIn` **synchronously from the click handler** — an `await` before it
loses the user gesture and the popup blocker eats the window.

```ts
import { signIn, resolveSameOrigin } from '@ahaslides-product/plugins-auth';

const login = new URL('/pages/login', PRESENTER_APP_URL);
login.searchParams.set('redirect', resolveSameOrigin('/auth-popup.html'));

const { status } = await signIn({
  url: login.toString(),
  onDone: async () => (await refetchIdentity()).signedIn,
  onBlocked: () => location.assign(fullPageLoginUrl),
});
```

`onDone` is **"re-check identity"**, never "assume success". That single choice
removes a whole class of special cases: a user who closes the popup without
logging in travels the same path, re-checks, comes back unauthenticated, and the
gate stays up.

### Outcomes

| `status` | Meaning |
| --- | --- |
| `authenticated` | `onDone()` reported a session. The only success. |
| `abandoned` | Popup closed, still no session. The user gave up — usually not an error worth showing. |
| `blocked` | `window.open` returned nothing. `onBlocked` has already run. |
| `unresolved` | Completion was signalled but `onDone()` never confirmed. A real fault — surface it, or fall back to the full-page login. |
| `timeout` | Nothing happened within `timeoutMs` (default 10 min). |
| `cancelled` | `cancelSignIn()` was called, e.g. on unmount. |

### How completion is detected

Two independent signals, no polling of `popup.closed` anywhere:

1. **`BroadcastChannel` ping** from the callback page — the fast path, and the
   only one that works while the opener already has focus.
2. **`focus` / `visibilitychange` on the opener** — the universal fallback.
   Closing a popup returns focus to whoever opened it, and that *is* an event.

Focus also fires when the user merely clicks back to the parent window, so it is
only conclusive alongside a closed popup; otherwise the flow re-checks and keeps
waiting. After a ping, a failed check is retried (`maxChecks`, `retryDelayMs`) —
the session is already in the jar, so `false` there means a slow identity
endpoint, not a failed login.

## Popup side

Whatever is served at the callback URL calls `notifyDone()` and nothing else:

```ts
import { notifyDone } from '@ahaslides-product/plugins-auth';
notifyDone();
```

A **dedicated static page** is the most robust option. Point the callback at an
application route instead and the popup must download that bundle — and run
whatever the entry point runs — before it can close; if the bundle is ever slow
or broken, the window never closes and the user is left staring at it. A page
whose whole body is the snippet above has almost nothing that can fail. A worker
can serve the equivalent inline without a file at all.

That page cannot import this module (it has no bundler), so it hard-codes
`DEFAULT_CHANNEL` and `DONE_MESSAGE`. Pin the duplicate with a test that reads
the file — aha-elearning does this in `LearnerSignInModal.test.tsx`.

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
