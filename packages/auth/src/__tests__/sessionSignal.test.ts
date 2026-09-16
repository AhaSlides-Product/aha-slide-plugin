// The fallback signal, for hosts the auth app will not talk to.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasSessionMarker, watchSessionSignal } from '../sessionSignal.js';

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  vi.useRealTimers();
  // jsdom cookies outlive a test; expire both markers explicitly.
  document.cookie = 'ahaLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'ahaToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('hasSessionMarker', () => {
  it('reports either marker, and nothing else', () => {
    expect(hasSessionMarker()).toBe(false);

    document.cookie = 'somethingElse=1';
    expect(hasSessionMarker()).toBe(false);

    document.cookie = 'ahaLoggedIn=1';
    expect(hasSessionMarker()).toBe(true);
  });

  it('accepts the legacy readable token as a marker', () => {
    document.cookie = 'ahaToken=abc';
    expect(hasSessionMarker()).toBe(true);
  });
});

describe('watchSessionSignal', () => {
  it('fires once when the marker appears', () => {
    const onAppear = vi.fn();
    watchSessionSignal({ onAppear });

    vi.advanceTimersByTime(3_000);
    expect(onAppear).not.toHaveBeenCalled();

    document.cookie = 'ahaLoggedIn=1';
    vi.advanceTimersByTime(1_000);
    expect(onAppear).toHaveBeenCalledTimes(1);

    // It stops itself: a host that could not verify the session must not be
    // asked again every second for as long as the form is up.
    vi.advanceTimersByTime(10_000);
    expect(onAppear).toHaveBeenCalledTimes(1);
  });

  // The expired-session user — the one most likely to be looking at a login
  // form — already carries the marker. An absolute read would fire instantly
  // and report a session that is not there.
  it('stays silent when the marker was already present', () => {
    document.cookie = 'ahaLoggedIn=1';
    const onAppear = vi.fn();
    watchSessionSignal({ onAppear });

    vi.advanceTimersByTime(10_000);
    expect(onAppear).not.toHaveBeenCalled();
  });

  it('stops on request', () => {
    const onAppear = vi.fn();
    const stop = watchSessionSignal({ onAppear });

    stop();
    document.cookie = 'ahaLoggedIn=1';
    vi.advanceTimersByTime(5_000);

    expect(onAppear).not.toHaveBeenCalled();
    expect(() => stop()).not.toThrow();
  });

  it('takes a custom read', () => {
    let signed = false;
    const onAppear = vi.fn();
    watchSessionSignal({ onAppear, read: () => signed, intervalMs: 50 });

    vi.advanceTimersByTime(200);
    expect(onAppear).not.toHaveBeenCalled();

    signed = true;
    vi.advanceTimersByTime(50);
    expect(onAppear).toHaveBeenCalledTimes(1);
  });
});
