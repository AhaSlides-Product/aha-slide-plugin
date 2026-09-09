import { afterEach, vi } from 'vitest';

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!window.getComputedStyle) {
  window.getComputedStyle = vi.fn().mockReturnValue({ getPropertyValue: () => '' }) as unknown as typeof window.getComputedStyle;
}

afterEach(() => {
  document.body.innerHTML = '';
});
