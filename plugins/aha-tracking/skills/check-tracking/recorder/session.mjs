// Accumulates everything a run captures and renders session.json.
// Pure with respect to the browser: it takes records, not pages.
import { decodeRecord } from './decode.mjs';

export function createSession({ allowExternal = false, recorderVersion = '1.0.0' } = {}) {
  const startedAt = new Date();
  const start = startedAt.getTime();
  const timeline = [];
  const screens = [];
  const hooksArmed = new Set();
  let seq = 0;
  let signalDetected = false;

  const push = (entry) => {
    seq += 1;
    timeline.push({ seq, t: Date.now() - start, ...entry });
  };

  return {
    addRaw(record, frame = 'top') {
      if (!record) return;
      if (record.via) hooksArmed.add(record.via);
      if (record.kind === 'bridge') hooksArmed.add('bridge');

      if (record.kind === 'action') {
        push({
          kind: 'action',
          type: record.type,
          el: record.el,
          origin: record.origin ?? 'manual',
          frame,
        });
        return;
      }

      for (const { name, props } of decodeRecord(record)) {
        signalDetected = true;
        push({ kind: 'event', name, props, via: record.via ?? 'bridge', frame });
      }
    },

    addNavigation(from, to) {
      push({ kind: 'action', type: 'navigate', from, to });
    },

    addScreen({ url, inventory }) {
      const screenId = screens.length + 1;
      screens.push({ screenId, url, sweptAt: new Date().toISOString(), inventory });
      return screenId;
    },

    get signalDetected() {
      return signalDetected;
    },

    toJSON() {
      return {
        meta: {
          startedAt: startedAt.toISOString(),
          endedAt: new Date().toISOString(),
          recorderVersion,
          hooksArmed: [...hooksArmed],
          allowExternal,
          signalDetected,
        },
        screens,
        timeline,
      };
    },
  };
}
