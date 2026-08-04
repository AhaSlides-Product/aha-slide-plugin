// Injected into every frame before any page script runs. Browser code only:
// no imports, no exports, no Node globals.
//
// It wraps the analytics send path so a copy of every payload reaches the
// recorder. The original function is always called with the original
// arguments, so the app cannot tell it has been wrapped.
(() => {
  if (window.__ahaTrackInstalled) return;
  window.__ahaTrackInstalled = true;

  const send = (record) => {
    try {
      if (typeof window.__ahaTrackSink === 'function') {
        window.__ahaTrackSink(JSON.stringify(record));
      }
    } catch {
      // Never let recording break the page under test.
    }
  };

  function bodyToString(body) {
    if (body == null) return null;
    if (typeof body === 'string') return body;
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
      return body.toString();
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) return null; // async read would reorder records
    try {
      return String(body);
    } catch {
      return null;
    }
  }

  const raw = (via, url, body) =>
    send({ kind: 'raw', via, url: String(url ?? ''), body: bodyToString(body), t: Date.now() });

  // --- navigator.sendBeacon -------------------------------------------------
  if (navigator.sendBeacon) {
    const original = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      raw('sendBeacon', url, data);
      return original(url, data);
    };
  }

  // --- window.fetch --------------------------------------------------------
  if (window.fetch) {
    const original = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : input?.url;
      raw('fetch', url, init?.body);
      return original.apply(this, arguments);
    };
  }

  // --- XMLHttpRequest ------------------------------------------------------
  if (window.XMLHttpRequest) {
    const openOriginal = XMLHttpRequest.prototype.open;
    const sendOriginal = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__ahaUrl = url;
      return openOriginal.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      raw('xhr', this.__ahaUrl, body);
      return sendOriginal.apply(this, arguments);
    };
  }

  const bridge = (name, props) =>
    send({ kind: 'bridge', name: String(name), props: props ?? {}, t: Date.now() });

  // Wraps `obj[method]`, forwarding to the original. Idempotent.
  function wrapMethod(obj, method, onCall) {
    const original = obj[method];
    if (typeof original !== 'function' || original.__ahaWrapped) return;
    const wrapper = function (...args) {
      try {
        onCall(...args);
      } catch {
        // recording must never break the call
      }
      return original.apply(this, args);
    };
    wrapper.__ahaWrapped = true;
    obj[method] = wrapper;
  }

  // Watches for `window[prop]` to be assigned — the object may not exist yet
  // (zoid assigns `xprops` after our injection). Fires once now if present,
  // and again on every future assignment.
  function onGlobal(prop, handler) {
    if (window[prop]) handler(window[prop]);
    let current = window[prop];
    try {
      Object.defineProperty(window, prop, {
        configurable: true,
        get: () => current,
        set: (value) => {
          current = value;
          try {
            handler(value);
          } catch {
            // ignore
          }
        },
      });
    } catch {
      // A non-configurable global: the initial check above is all we get.
    }
  }

  // --- window.mixpanel.track ----------------------------------------------
  onGlobal('mixpanel', (mp) => {
    if (mp && typeof mp.track === 'function') wrapMethod(mp, 'track', bridge);
  });

  // --- window.xprops.trackGA4AndMixpanel (zoid bridge, slide plugins) ------
  onGlobal('xprops', (xp) => {
    if (xp && typeof xp.trackGA4AndMixpanel === 'function') {
      wrapMethod(xp, 'trackGA4AndMixpanel', bridge);
    }
  });

  // === user actions ========================================================
  const MAX_TEXT = 80;

  function cssPath(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 4) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(`${part}#${node.id}`);
        break;
      }
      const parent = node.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter((c) => c.tagName === node.tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.join('>');
  }

  function nearestSection(el) {
    const container = el.closest('section, header, footer, aside, dialog, [role=dialog], main');
    if (!container) return null;
    const heading = container.querySelector('h1, h2, h3, [role=heading]');
    const label = heading?.textContent ?? container.getAttribute('aria-label');
    return label ? label.trim().slice(0, MAX_TEXT) : null;
  }

  function describe(el) {
    if (!el || el.nodeType !== 1) return null;
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText ?? el.textContent ?? '').trim().slice(0, MAX_TEXT) || null,
      testId: el.getAttribute('data-testid'),
      ariaLabel: el.getAttribute('aria-label'),
      name: el.getAttribute('name'),
      role: el.getAttribute('role'),
      type: el.getAttribute('type'),
      href: el.getAttribute('href'),
      classes: (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
      disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
      ariaHidden: el.getAttribute('aria-hidden') === 'true',
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      section: nearestSection(el),
      path: cssPath(el),
    };
  }
  window.__ahaDescribe = describe;

  const action = (type, el) => send({ kind: 'action', type, el: describe(el), t: Date.now() });

  // Capture phase so the record exists even if the app stops propagation.
  document.addEventListener('click', (e) => action('click', e.target), true);
  document.addEventListener('change', (e) => action('change', e.target), true);
  document.addEventListener('submit', (e) => action('submit', e.target), true);

  // === screen inventory ====================================================
  const INTERACTIVE = [
    'button',
    'a[href]',
    'input:not([type=hidden])',
    'textarea',
    'select',
    '[contenteditable=true]',
    '[role=button]',
    '[role=switch]',
    '[role=tab]',
    '[role=menuitem]',
    '[role=checkbox]',
    '[role=radio]',
    '[role=link]',
  ].join(',');

  function collect() {
    return [...document.querySelectorAll(INTERACTIVE)].filter((el) => {
      const style = getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    });
  }

  // A selector that can be re-resolved later. A data-testid is stable across
  // re-renders; the structural path is the fallback. Indices are NOT used:
  // the sweep re-enumerates after every recovery, so any cached index goes
  // stale the first time the DOM changes.
  function selectorFor(el) {
    const testId = el.getAttribute('data-testid');
    if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
    return cssPath(el);
  }

  function resolve(selector, nth) {
    let matches;
    try {
      matches = [...document.querySelectorAll(selector)];
    } catch {
      return null;
    }
    return matches[nth] ?? null;
  }

  window.__ahaInventory = () => {
    const seen = new Map();
    return collect().map((el, index) => {
      const selector = selectorFor(el);
      const nth = seen.get(selector) ?? 0;
      seen.set(selector, nth + 1);
      return {
        index,
        selector,
        nth,
        expandable:
          el.getAttribute('aria-expanded') === 'false' || el.getAttribute('aria-haspopup') != null,
        ...describe(el),
      };
    });
  };

  // Returns 'gone' when the element has detached since enumeration — the sweep
  // marks those ⚠️ rather than guessing.
  window.__ahaClickBySelector = (selector, nth) => {
    const el = resolve(selector, nth);
    if (!el || !el.isConnected) return 'gone';
    el.click();
    return 'clicked';
  };

  window.__ahaExpandables = () =>
    window.__ahaInventory()
      .filter((e) => e.expandable)
      .map(({ selector, nth }) => ({ selector, nth }));
})();
