import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callbackPageHtml, callbackScript } from '../callbackPage.js';
import { DEFAULT_CHANNEL, DONE_MESSAGE } from '../constants.js';
import { installFakeBroadcastChannel, type FakeChannelRegistry } from './fakeBroadcastChannel.js';

let channels: FakeChannelRegistry;

/** Run generated source the way a browser would, so these tests cover the
 *  behaviour consumers ship rather than the string we happened to build. */
function run(source: string): void {
  new Function(source)();
}

/**
 * Parse a generated page the way a browser would.
 *
 * A real parser rather than a regex, and not only to satisfy the scanner that
 * flagged the regex twice: `</script\t\n bar>` is a valid end tag, `<SCRIPT>`
 * is a valid start tag, and a pattern that keeps growing to cover them is a
 * worse version of the parser already sitting in the test environment. It also
 * asserts something the regex never did — that the generated string is
 * well-formed HTML at all.
 */
function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

/** The `<script>` body out of a generated page, so the page and the bare
 *  script cannot drift apart unnoticed. */
function scriptFrom(html: string): string {
  const script = parse(html).querySelector('script');
  if (!script) throw new Error('no <script> in generated page');
  return script.textContent ?? '';
}

beforeEach(() => {
  channels = installFakeBroadcastChannel();
  document.body.innerHTML = '<p id="aha-auth-popup-message">Signing you in…</p>';
});

afterEach(() => {
  channels.restore();
  vi.restoreAllMocks();
});

describe('callbackScript', () => {
  it('pings the default channel and closes the window', () => {
    const listener = channels.listen(DEFAULT_CHANNEL);
    const close = vi.spyOn(globalThis, 'close').mockImplementation(() => {});

    run(callbackScript());

    expect(listener.messages).toEqual([{ type: DONE_MESSAGE }]);
    expect(close).toHaveBeenCalled();
  });

  it('carries no payload beyond the type', () => {
    const listener = channels.listen(DEFAULT_CHANNEL);
    vi.spyOn(globalThis, 'close').mockImplementation(() => {});

    run(callbackScript());

    expect(Object.keys(listener.messages[0] as object)).toEqual(['type']);
  });

  it('honours a custom channel name', () => {
    const wrong = channels.listen(DEFAULT_CHANNEL);
    const right = channels.listen('livelify-auth');
    vi.spyOn(globalThis, 'close').mockImplementation(() => {});

    run(callbackScript({ channelName: 'livelify-auth' }));

    expect(right.messages).toHaveLength(1);
    expect(wrong.messages).toHaveLength(0);
  });

  // The options are strings that get spliced into a page. Treat them as
  // untrusted even though today's callers are all our own code.
  it('escapes a channel name that tries to break out of the script', () => {
    const hostile = '</script><img src=x onerror=alert(1)>';
    const script = callbackScript({ channelName: hostile });

    expect(script).not.toContain('</script>');
    expect(callbackPageHtml({ channelName: hostile })).not.toContain('</script><img');
  });

  it('still closes the window when BroadcastChannel is unavailable', () => {
    channels.breakConstructor();
    const close = vi.spyOn(globalThis, 'close').mockImplementation(() => {});

    expect(() => run(callbackScript())).not.toThrow();
    expect(close).toHaveBeenCalled();
  });

  it('survives a window.close() the browser refuses', () => {
    const listener = channels.listen(DEFAULT_CHANNEL);
    vi.spyOn(globalThis, 'close').mockImplementation(() => {
      throw new Error('not script-closable');
    });

    expect(() => run(callbackScript())).not.toThrow();
    // The ping still went out — that is what the opener is waiting on.
    expect(listener.messages).toHaveLength(1);
  });

  it('tells the visitor what happened when nothing closed the window', () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'close').mockImplementation(() => {});

    run(callbackScript({ settledText: 'All done.' }));
    vi.advanceTimersByTime(600);

    expect(document.getElementById('aha-auth-popup-message')?.textContent).toBe('All done.');
    vi.useRealTimers();
  });
});

describe('callbackPageHtml', () => {
  it('is a complete document', () => {
    const html = callbackPageHtml();
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).toContain('id="aha-auth-popup-message"');
  });

  it('embeds a script that behaves exactly like callbackScript', () => {
    const listener = channels.listen(DEFAULT_CHANNEL);
    const close = vi.spyOn(globalThis, 'close').mockImplementation(() => {});

    run(scriptFrom(callbackPageHtml()));

    expect(listener.messages).toEqual([{ type: DONE_MESSAGE }]);
    expect(close).toHaveBeenCalled();
  });

  // PR #131 review, round 3. The script context was escaped from the start; the
  // HTML context was not, which is the inconsistency that mattered — a
  // `pendingText` fed from a translation catalogue is an ordinary thing to do.
  it.each([
    ['title', { title: '<img src=x onerror=alert(1)>' }],
    ['pendingText', { pendingText: '<img src=x onerror=alert(1)>' }],
  ])('escapes %s so it cannot inject markup', (_label, options) => {
    const html = callbackPageHtml(options);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes lang so it cannot close the attribute and add another', () => {
    const html = callbackPageHtml({ lang: '" onload="alert(1)' });
    expect(html).not.toContain('onload="alert(1)"');
    expect(html).toContain('lang="&quot; onload=&quot;alert(1)"');
  });

  // Escaping has to be reversible, not just destructive: the visitor must still
  // read the text the caller passed.
  it('renders escaped copy back as the original text', () => {
    const text = 'Signing you in… <Ben & co> "now"';

    const doc = parse(callbackPageHtml({ pendingText: text }));

    expect(doc.getElementById('aha-auth-popup-message')?.textContent).toBe(text);
  });

  it('takes the page copy from options', () => {
    const html = callbackPageHtml({ title: 'Nearly there', pendingText: 'One moment' });
    expect(html).toContain('<title>Nearly there</title>');
    expect(html).toContain('>One moment</p>');
  });
});
