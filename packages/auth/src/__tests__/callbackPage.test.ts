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

/** The `<script>` body out of a generated page, so the page and the bare
 *  script cannot drift apart unnoticed. */
function scriptFrom(html: string): string {
  const match = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (!match) throw new Error('no <script> in generated page');
  return match[1];
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

  it('takes the page copy from options', () => {
    const html = callbackPageHtml({ title: 'Nearly there', pendingText: 'One moment' });
    expect(html).toContain('<title>Nearly there</title>');
    expect(html).toContain('>One moment</p>');
  });
});
