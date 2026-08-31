import { computed, ref, watch, type Ref } from 'vue';
import { ApiClient } from '@aha/api';
import { SubmissionType, getBucket } from '@aha/common';
import {
  ATTR_GROUPS,
  ATTR_REVEALED,
  ATTR_ROSTER,
  ATTR_TARGET_SIZE,
  MIN_GROUP_SIZE,
  SLIDE_TYPE,
  SUBMITTED_BUCKET,
} from '../constants';
import type { Group, Participant, PickAttributes } from '../types';

interface PresenterContext {
  baseUrl: Ref<string | undefined>;
  slideProps: Ref<Record<string, any> | undefined>;
  presentationProps: Ref<Record<string, any> | undefined>;
  audiences: Ref<Record<string, any> | undefined>;
  targetSize: Ref<number>;
  upsertSlideAttribute?: (payload: { slideId?: string | number; attributeKey: string; attributeValue: any }) => Promise<any>;
  subscribeTopic?: (options: { topic: string; callback: (topic: string, message: any) => void }) => void;
  unsubscribeTopic?: (topic: string) => void;
}

/** Normalise the host `audiences` value (array or keyed object) into a roster. */
function toRoster(audiences: Record<string, any> | undefined): Participant[] {
  if (!audiences) return [];
  const list = Array.isArray(audiences) ? audiences : Object.values(audiences);
  return list
    .map((a: any) => {
      const id = a?.audienceId ?? a?.id ?? a?.participantId;
      if (id == null) return null;
      return {
        id: String(id),
        name: a?.audienceName ?? a?.name ?? '',
        emoji: a?.audienceEmoji ?? a?.emoji ?? '🙂',
      } as Participant;
    })
    .filter((p): p is Participant => p !== null);
}

/**
 * Presenter-side grouping state: it owns the roster, tracks how many people
 * have submitted, and — on the "Form groups" action — collects every private
 * pick, runs the server-side algorithm, and reveals the result to every screen.
 */
export function usePresenterGrouping(ctx: PresenterContext) {
  const roster = computed<Participant[]>(() => toRoster(ctx.audiences.value));
  const totalCount = computed(() => roster.value.length);

  const submittedIds = ref<Set<string>>(new Set());
  const submittedCount = computed(() => submittedIds.value.size);

  const forming = ref(false);
  const error = ref<string | null>(null);
  const groups = ref<Group[]>([]);
  const revealed = ref(false);

  function makeClient(): ApiClient {
    if (!ctx.baseUrl.value) throw new Error('baseUrl is not available');
    return new ApiClient(ctx.baseUrl.value, (window as any).xprops?.token);
  }

  function bucketConfig() {
    return {
      presentationId: ctx.presentationProps.value?.id,
      slideId: ctx.slideProps.value?.id,
      slideVersion: ctx.slideProps.value?.version,
    };
  }

  /** Read every submission and index picks by sender (presenter-only view). */
  async function collectPicks(): Promise<{ picks: Record<string, string[]>; senderIds: string[] }> {
    const submissions = await makeClient().getSubmissions<PickAttributes>({
      slideId: Number(ctx.slideProps.value?.id),
      slideVersion: Number(ctx.slideProps.value?.version),
      type: SubmissionType.Response,
    });
    const picks: Record<string, string[]> = {};
    for (const submission of submissions) {
      picks[submission.senderId] = submission.attributes?.pickedPeerIds ?? [];
    }
    return { picks, senderIds: Object.keys(picks) };
  }

  /** Seed the submitted set from any submissions already made. */
  async function loadSubmittedCount(): Promise<void> {
    try {
      const { senderIds } = await collectPicks();
      submittedIds.value = new Set(senderIds);
    } catch (err) {
      console.warn('[preferenceGrouping] could not load submissions', err);
    }
  }

  /**
   * Live-update the tally from the backend's per-submission ping. Returns the
   * subscribed topic so the caller can release it on unmount — otherwise the
   * keep-alive preload iframe stacks stale handlers that each recount pings.
   */
  function watchSubmissions(): string {
    const topic = getBucket(SUBMITTED_BUCKET, bucketConfig());
    ctx.subscribeTopic?.({
      topic,
      callback: (_t, message) => {
        const senderId = message?.senderId;
        if (senderId) {
          const next = new Set(submittedIds.value);
          next.add(String(senderId));
          submittedIds.value = next;
        }
      },
    });
    return topic;
  }

  /**
   * Rehydrate the reveal from persisted slide attributes so a presenter
   * refresh or back-nav after forming groups shows the groups again rather
   * than the "Choose up to N…" tally.
   */
  function restoreState(attributes: Record<string, any> | undefined): void {
    if (!attributes) return;
    const storedGroups = attributes[ATTR_GROUPS] ?? attributes.preferenceGrouping?.[ATTR_GROUPS];
    const storedRevealed = attributes[ATTR_REVEALED] ?? attributes.preferenceGrouping?.[ATTR_REVEALED];
    if (Array.isArray(storedGroups) && storedGroups.length > 0) {
      groups.value = storedGroups;
      revealed.value = !!storedRevealed;
    }
  }

  /** Keep the audience-visible roster in sync with who has joined. */
  function publishRoster(): void {
    if (!ctx.upsertSlideAttribute || roster.value.length === 0) return;
    ctx.upsertSlideAttribute({
      slideId: ctx.slideProps.value?.id,
      attributeKey: ATTR_ROSTER,
      attributeValue: roster.value,
    });
  }

  const formGroupsUrl = computed(
    () => `${ctx.baseUrl.value}/api/plugins/${SLIDE_TYPE}/external/form-groups`,
  );

  /**
   * Collect the picks, call the server-side algorithm, then write the groups
   * (and the roster snapshot) to slide attributes so every audience can render
   * its own group. Returns the formed groups.
   */
  async function formGroups(): Promise<Group[]> {
    if (forming.value) return groups.value;
    forming.value = true;
    error.value = null;
    try {
      const { picks } = await collectPicks();
      const response = await makeClient().fetchUrl(formGroupsUrl.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: roster.value.map((p) => p.id),
          picks,
          targetSize: ctx.targetSize.value,
          minSize: MIN_GROUP_SIZE,
        }),
      });
      const formed: Group[] = response?.groups ?? [];
      groups.value = formed;

      await ctx.upsertSlideAttribute?.({
        slideId: ctx.slideProps.value?.id,
        attributeKey: ATTR_ROSTER,
        attributeValue: roster.value,
      });
      await ctx.upsertSlideAttribute?.({
        slideId: ctx.slideProps.value?.id,
        attributeKey: ATTR_GROUPS,
        attributeValue: formed,
      });
      await ctx.upsertSlideAttribute?.({
        slideId: ctx.slideProps.value?.id,
        attributeKey: ATTR_TARGET_SIZE,
        attributeValue: ctx.targetSize.value,
      });
      revealed.value = true;
      await ctx.upsertSlideAttribute?.({
        slideId: ctx.slideProps.value?.id,
        attributeKey: ATTR_REVEALED,
        attributeValue: true,
      });
      return formed;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      forming.value = false;
    }
  }

  watch(roster, () => publishRoster());

  return {
    roster,
    totalCount,
    submittedCount,
    groups,
    revealed,
    forming,
    error,
    loadSubmittedCount,
    watchSubmissions,
    restoreState,
    publishRoster,
    formGroups,
  };
}
