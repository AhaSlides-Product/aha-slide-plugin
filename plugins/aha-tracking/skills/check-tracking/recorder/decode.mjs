// Turns a raw record from inpage.js into zero or more { name, props }.
// Runs in Node so inpage.js stays small and this stays unit-testable.

export function looksLikeTracking(url = '', body = null) {
  const path = String(url);
  if (/\/(track|engage)\b/.test(path)) return true;
  if (typeof body === 'string' && body.startsWith('data=')) return true;
  return false;
}

function tryJson(text) {
  if (typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function fromBase64(text) {
  try {
    return Buffer.from(text, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

function normalise(parsed) {
  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list
    .filter((e) => e && typeof e.event === 'string')
    .map((e) => ({ name: e.event, props: e.properties ?? {} }));
}

export function decodeRecord(record) {
  if (!record) return [];

  // The zoid bridge hands us the event directly — nothing to decode.
  if (record.kind === 'bridge') {
    return [{ name: record.name, props: record.props ?? {} }];
  }

  const { url, body } = record;
  if (!looksLikeTracking(url, body)) return [];
  if (typeof body !== 'string' || body.length === 0) return [];

  let text = body;
  if (text.startsWith('data=')) {
    const value = text.slice('data='.length).replace(/\+/g, ' ');
    let decoded;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      decoded = value;
    }
    text = decoded;
  }

  const parsed = tryJson(text) ?? tryJson(fromBase64(text));
  if (parsed == null) return [];
  return normalise(parsed);
}
