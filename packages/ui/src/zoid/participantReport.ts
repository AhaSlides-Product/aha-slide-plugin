import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, type Ref } from 'vue';
import { autoReportHeight, type UseSlidePluginOptions } from './base';

/**
 * Properties for the participant report plugin iframe (e.g. pin-on-image).
 * Used by the report app to pass pre-fetched answer data into the slide plugin iframe.
 */
export interface ParticipantReportPluginProps {
  /** The URL of the plugin to be loaded in the iframe */
  url: string;
  /** Pre-fetched response/answer data to render in the iframe */
  answers?: any;
  /** Callback to report height changes from the child to the parent */
  onHeightChange?: (height: number | null) => void;
  imageUrl?: string,
  presentationColorPalette?: object,
}

/**
 * ParticipantReportPluginIframe is a cross-domain component (zoid) that allows
 * the report app to embed slide plugin iframes and pass answer data directly,
 * avoiding redundant API calls from the child.
 */
export const ParticipantReportPluginIframe = zoid.create({
  tag: 'participant-report-plugin-iframe',
  url: ({ props }: { props: ParticipantReportPluginProps }) => props.url,
  props: {
    url: {
      type: 'string',
      required: true,
      queryParam: false,
    },
    imageUrl: {
      type: 'string',
      required: false,
    },
    presentationColorPalette: {
      type: 'object',
      required: false,
    },
    answers: {
      type: 'array',
      required: false,
    },
    onHeightChange: {
      type: 'function',
      required: false,
    },
  },
  prerenderTemplate({ doc }: { doc: Document }) {
    if (!doc) return null
    doc.body.style.overflow = 'hidden'
    return doc.documentElement
  },
});

/**
 * Return type for the participant report plugin hook.
 */
export interface ParticipantReportPluginReturn {
  answers: Ref<any[] | undefined>;
  reportHeight: () => void;
}

/**
 * Hook for child iframes to access participant report data passed via zoid xprops.
 */
export function useParticipantReportPlugin(
  options: UseSlidePluginOptions = { autoHeight: true }
): ParticipantReportPluginReturn {
  const xprops = (window as any).xprops;
  const answers = ref<any[] | undefined>(xprops?.answers);

  onMounted(() => {
    let cleanup = () => {};
    if (options.autoHeight !== false) {
      cleanup = autoReportHeight();
    } else if (xprops && typeof xprops.onHeightChange === 'function') {
      xprops.onHeightChange(null);
    }

    if (xprops && typeof xprops.onProps === 'function') {
      xprops.onProps((newProps: any) => {
        if (newProps.answers) answers.value = newProps.answers;
      });
    }
    return cleanup;
  });

  const reportHeight = () => {
    if (xprops && typeof xprops.onHeightChange === 'function') {
      const app = document.getElementById('app') || document.getElementById('root');
      const height = app
        ? app.scrollHeight
        : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      xprops.onHeightChange(height);
    }
  };

  return { answers, reportHeight };
}
