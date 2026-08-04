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
})();
