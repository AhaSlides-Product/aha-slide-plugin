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
})();
