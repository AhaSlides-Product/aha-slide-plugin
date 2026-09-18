# @aha/auth

Embedded sign-in for AhaSlides apps that delegate login to the platform but do
not want a full-page redirect. Published as `@ahaslides-product/plugins-auth`.

The platform's auth app (`aha-auth`) serves its login and signup forms at
`/authen/embed/*` built to be framed: they never navigate on success, they
postMessage the outcome to the host and let it take its own overlay down. This
package is the **host half** of that conversation.

## What it is, and what it deliberately is not

It is a **signal orchestrator**. It works out which URL to frame, which origin
may speak to you, what each message means, and when to stop listening. It then
asks your app to re-check identity, and reports how the attempt ended.

It is **not** an auth library and not a UI kit:

- it renders nothing — no iframe, no overlay, no spinner, no styles;
- it never sees a password or a token. The session arrives as a cookie the
  framed form sets, and the only thing read of that cookie is whether one
  exists;
- it cannot decide that anyone is signed in. `onDone()` — your call to your own
  identity endpoint — is what decides.

## The one invariant

**The host must be an AhaSlides sub-domain.** The frame is same-site, which is
what makes the session cookie general-api sets *inside* it first-party to the
host as well — so no credential ever crosses the postMessage boundary. A host on
an unrelated domain would have that cookie dropped as third-party, and no amount
of message plumbing would fix it.

The second-order rule: **`baseUrl` must be `http(s)`**. It becomes an iframe
`src`, which executes in the host document. A `javascript:` base out of a
mis-read config would run there, so it is rejected at the call site.

## Integrating it — three steps

### 1. Install

```bash
npm install @ahaslides-product/plugins-auth
```

### 2. Run the flow, render the frame

`mount()` receives the URL and returns a teardown. That callback is the whole
DOM contract — draw the frame however your app wants it drawn.

```ts
import { signInWithFrame } from '@ahaslides-product/plugins-auth';

const { status } = await signInWithFrame({
  baseUrl: PRESENTER_APP_URL,           // https://presenter.ahaslides.com
  mount: (src) => {
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:1000';
    document.body.append(frame);
    return () => frame.remove();        // runs exactly once, however the flow ends
  },
  onDone: async () => (await refetchIdentity()).ok,
});

if (status === 'unresolved') location.assign(fullPageLoginUrl);
```

The frame paints its own dim and draws its own ✕ (which posts `close`). Pass
`dim: false` if your app is already dimming behind it, `closable: false` if it
draws its own dismiss control.

### 3. Make your identity state reactive — the step everyone misses

A cookie appearing fires no event. `onDone()` returning `true` does not, on its
own, re-render anything — whatever your app uses to decide "signed in" has to
re-read after the flow, or the user stares at a login prompt while holding a
perfectly good session.

```ts
const { status } = await signInWithFrame({ … });
if (status === 'authenticated') notifySessionChanged();   // your own signal
```

## Outcomes

| status | meaning |
| --- | --- |
| `authenticated` | `onDone()` reported a live session. The only success. |
| `abandoned` | The user dismissed the form without signing in. |
| `unresolved` | Success was signalled but `onDone()` never confirmed. A real fault — recover with a full-page login. |
| `timeout` | Nothing happened within `timeoutMs` (default 10 min). |
| `cancelled` | `cancelFrameSignIn()` was called, e.g. the host unmounted. |

Consent flows (see below) end on three of their own instead. They are
unreachable unless you opt in, so existing `switch`es keep working untouched.

| status | meaning |
| --- | --- |
| `consent_granted` | Signed in, pressed Allow. The popup is *on its way* to your redirect URI — wait for your own callback. |
| `consent_denied` | Signed in, refused the client. Terminal. |
| `consent_abandoned` | Signed in, but the card was never answered within `consentTimeoutMs`. Not a fault — they have a session; offer the authorisation again. |

## How completion is detected

Three signals, in order of authority.

**`success` from the frame** is the strong one. The cookie is already set when
it arrives — nothing is transferred by the message itself — so a `false` from
`onDone()` here means a slow identity endpoint rather than a failed login, and
is retried (`maxChecks`, default 5, `retryDelayMs` apart) before giving up as
`unresolved`.

**The session-marker watch** is the weak one. The auth app posts nothing to an
origin it will not vouch for — notably **any origin carrying a port**, which is
every local dev server — so there the form renders, logs the user in, and says
nothing at all. `watchSessionSignal` notices the marker cookie appear and
prompts one check. Only a false→true transition counts: the marker outlives an
expired session, so the user most likely to be looking at a login form already
has one. Disable with `watchSession: false`, or substitute your own predicate.

**`close`** is the user's answer, and settles `abandoned` — unless a success
sequence is already running, which owns the outcome.

**`abandoned`** is the auth app saying it stopped waiting on its popup — the
user dismissed it (`closed`), or its own watchdog expired (`timeout`). It fires
in every flow, not just the consent one.

It is **reported and never acted on**: `onAbandon` fires, and the promise stays
live. The framed form is still up and still clickable when the popup goes away,
so settling here would tear down the very surface the user would retry from —
the same mistake as settling on a marker-watch negative. Use it to stop a
spinner and offer that retry; call `cancelFrameSignIn()` from the callback if
your host would rather give up.

It is also **silent when the browser refused to open the popup at all**, which
is why `consentTimeoutMs` is still load-bearing. That case is indistinguishable
from a user who never answered, so a deadline is the only thing covering it.

## Getting an authorization code: `redirectUri`

A host that needs an OAuth code rather than just a session passes one:

```ts
const { status } = await signInWithFrame({
  baseUrl: PRESENTER_APP_URL,
  redirectUri: `${PRESENTER_APP_URL}/api/auth/oauth/authorize?client_id=…`,
  mount: (src) => renderOverlay(src),
  onDone: async () => (await refetchIdentity()).ok,   // not called in this mode
  onConsent: (granted) => track('consent', { granted }),
});
```

This is a **mode switch on the auth app**, not just a destination. The embed
stops asking for a password, collects an email address only, and does the real
sign-in in a popup on its own origin — because the point of a redirect is that
the session has somewhere to go, and only a first-party window can take it
there. The popup then follows your URI to the authorize endpoint and the consent
card, and relays the answer back through the frame.

So **`success` stops being the end of the flow**. You get it when the user has a
platform session; the code has not been issued yet. Three consequences, all
handled for you:

- **`onDone()` is never called, and the session-marker watch is off.** Both ask
  "does the *host* have a session", and until your own callback exchanges the
  code the honest answer is no. Cross-site you cannot read the cookie at all;
  same-site you *can*, which is the dangerous half — it would confirm, settle the
  flow, and unmount the frame mid-consent.
- **The frame must stay mounted until `consent` arrives.** The popup relays
  through `window.opener`, and that is the frame. Do not unmount on `success`.
- **A deadline backs the whole thing up.** `consentTimeoutMs` (default 5 min)
  settles `consent_abandoned` rather than letting a flow hang to `timeoutMs`.
  See below for why it is still needed now that the popup reports itself.

### What the frame is entitled to tell you

Nothing crosses the postMessage boundary that a host could authorise on, and
that is the design rather than a missing feature.

A `success` payload is **unverifiable at the receiving end**. Any page can post
a well-shaped `{ id, email, … }` — which is why the origin is checked before the
payload is read, and why `AuthEmbedUser` is advisory. It cannot mint a session,
however convenient it looks.

`consent_granted` is a claim of the same kind, and it is the only part of the
exchange a host is entitled to act on: *the user said yes, so proceed*. The
identity assertion you can actually trust arrives the other way — signed by
general-api, at your `redirect_uri`, over a back-channel you control. So "the
code never comes back through the frame" is the property that makes the flow
worth using, not a limitation of it.

Which also means the two outcomes reach you on **different channels, and joining
them is yours to do**. `consent_granted` resolves in the host page, via the
frame. The code lands at `redirect_uri`, loaded in the popup. Neither knows about
the other: if your `redirect_uri` is a server endpoint the exchange happens out
of the browser entirely; if it is a browser route doing a PKCE exchange, the
popup and your host page are same-origin, so `BroadcastChannel` is the natural
link between them — not `window.opener`, which is the auth app's frame.

`awaitConsent: false` keeps the ordinary `authenticated`/`unresolved` semantics
with a `redirectUri` — correct when the target is not an authorize endpoint and
so will never produce a consent card. The auth app cannot tell the difference:
the URI is opaque to it, and once the popup follows it there is no channel back.

The mode also turns itself on **without a `redirectUri`** whenever the framing
page is cross-site, since a cross-site frame cannot read the session cookie
either. You need do nothing for that case, but the frame may be email-only when
you did not ask for it.

### If the frame never loads

That is the host's call, not this package's: it cannot see your iframe's `load`
event. Run your own timer alongside the flow and fall back to a full-page login
if nothing has painted — `onReady` fires when the form reports itself up.

## Lower-level: `createSignInFrame`

When you want the events raw — a Vue app driving its own transitions, a page
that reveals the frame only on `ready` — subscribe directly:

```ts
const session = createSignInFrame({
  baseUrl: PRESENTER_APP_URL,
  onReady:   () => (iframe.style.opacity = '1'),
  onSuccess: (user) => refetchIdentity(),   // `user` is advisory, never authorisation
  onClose:   () => unmount(),
});
iframe.src = session.src;
// later
session.dispose();
```

`authEmbedUrl()`, `authEmbedOrigin()` and `readAuthEmbedMessage()` are exported
for hosts that want to do even the subscription themselves.

## Contract between apps

Messages are `{ source: 'ahaslides-auth', type, …payload }`, and the authority
is `aha-auth/src/services/embedBridge.ts`.

| event | meaning |
| --- | --- |
| `ahaslides:auth:ready` | the form is up; reveal the frame |
| `ahaslides:auth:success` | signed in; the cookie is set |
| `ahaslides:auth:close` | dismissed; unmount the frame |
| `ahaslides:auth:consent` | the OAuth consent card was answered; carries `granted` |
| `ahaslides:auth:abandoned` | the auth app gave up on its popup; carries `reason` (`closed` \| `timeout`) |

A `consent` carrying no boolean `granted` is **dropped**, not defaulted:
`granted` is the user's decision, and guessing it either invents a refusal
nobody made or authorises a client on their behalf. An `abandoned` with an
unrecognised `reason` is dropped for the same reason.

`readAuthEmbedMessage()` checks `event.origin` **before** it looks at the
payload — any page can post a perfectly-shaped `success`, and acting on one
would hand a foreign origin whatever your app does on sign-in. The `user` on a
`success` is copied field by field and is advisory only: prefill a greeting with
it, never authorise anything.

## Constraints worth knowing

- **The auth app must allow your origin** (`VITE_EMBED_ALLOWED_HOSTS`, defaulting
  to its own apex). An unlisted host still gets a working form and receives no
  messages at all — silence is the deliberate failure mode there.
- **The response must be framable.** The origin serving `/authen/*` has to allow
  your host as `frame-ancestors`. If it sends `X-Frame-Options: DENY`, the frame
  is blank and nothing here can tell.
- **Federated sign-in opens its own popup** inside the frame, because providers
  refuse to be framed. That is the auth app's business, not the host's.
- **A `redirectUri` is validated here as well as there.** The auth app treats a
  value it rejects as absent, which silently restores the password flow — so a
  bad one throws at the call site instead of doing nothing visible.
- **A blocked popup still reports nothing.** The auth app opens it from a
  gesture inside a cross-origin iframe, which Safari treats more strictly than a
  same-origin one, and a window that never opens sends no `abandoned` — the form
  simply stays up to be clicked again. If the user does not retry, that surfaces
  here as `consent_abandoned`. Read that status as "no answer", never as "the
  user declined": it covers a browser's refusal as well as a person's.

## Migrating from v0.1 (popup)

v0.1 opened the platform login in a popup and needed a closer page on your own
origin. All of it is gone: `signIn`, `cancelSignIn`, `notifyDone`,
`callbackPageHtml`, `callbackScript`, `resolveSameOrigin`, `resolveLoginUrl` and
the channel constants. Delete the callback page and any deploy rule that served
it; `signInWithFrame()` needs no asset of yours.

`SignInOutcome`/`SignInStatus` survive, minus `blocked` — there is no window for
a blocker to eat.

## Development

```bash
npm run build     -w @aha/auth   # tsconfig.build.json — excludes tests from dist
npm run typecheck -w @aha/auth   # tsconfig.json — INCLUDES tests
npm run test      -w @aha/auth   # typecheck, then vitest
```
