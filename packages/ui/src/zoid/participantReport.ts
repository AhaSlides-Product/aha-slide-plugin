import * as zoid from 'zoid/dist/zoid.frameworks';
import { ref, onMounted, type Ref } from 'vue';
import { autoReportHeight } from './base';
import type { ParticipantReportPluginProps, UseSlidePluginOptions } from '@aha/ui-vanilla';

export type { ParticipantReportPluginProps } from '@aha/ui-vanilla';

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
    presentationLighterColorPalette: {
      type: 'array',
      required: false,
    },
    presentation: {
      type: 'object',
      required: false,
    },
    slide: {
      type: 'object',
      required: false,
    },
    slideAttributes: {
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
  /** The slide the answers belong to (`textColour`, `slideType`, …). */
  slide: Ref<Record<string, any> | undefined>;
  /** The slide's persisted attributes, keyed by attribute type — read config from `slideAttributes.config`. */
  slideAttributes: Ref<Record<string, any> | undefined>;
  /** The presentation the answers belong to (`language`, `fontFamily`, …). */
  presentation: Ref<Record<string, any> | undefined>;
  presentationColorPalette: Ref<string[] | undefined>;
  presentationLighterColorPalette: Ref<string[] | undefined>;
  reportHeight: () => void;
}

/**
 * Hook for child iframes to access participant report data passed via zoid xprops.
 *
 * Read-only by design: a report view draws what one participant already submitted,
 * so this exposes data plus the height reporter, and nothing that mutates.
 */
export function useParticipantReportPlugin(
  options: UseSlidePluginOptions = { autoHeight: true }
): ParticipantReportPluginReturn {
  const xprops = (window as any).xprops;
  const answers = ref<any[] | undefined>(xprops?.answers);
  const slide = ref<Record<string, any> | undefined>(xprops?.slide);
  const slideAttributes = ref<Record<string, any> | undefined>(xprops?.slideAttributes);
  const presentation = ref<Record<string, any> | undefined>(xprops?.presentation);
  const presentationColorPalette = ref<string[] | undefined>(xprops?.presentationColorPalette);
  const presentationLighterColorPalette = ref<string[] | undefined>(xprops?.presentationLighterColorPalette);

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
        if (newProps.slide) slide.value = { ...newProps.slide };
        if (newProps.slideAttributes) slideAttributes.value = { ...newProps.slideAttributes };
        if (newProps.presentation) presentation.value = { ...newProps.presentation };
        if (newProps.presentationColorPalette) {
          presentationColorPalette.value = [...newProps.presentationColorPalette];
        }
        if (newProps.presentationLighterColorPalette) {
          presentationLighterColorPalette.value = [...newProps.presentationLighterColorPalette];
        }
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

  return {
    answers,
    slide,
    slideAttributes,
    presentation,
    presentationColorPalette,
    presentationLighterColorPalette,
    reportHeight,
  };
}
