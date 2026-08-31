import { computed, ref, type Ref } from 'vue';
import { ApiClient } from '@aha/api';
import { SubmissionSenderType, SubmissionType } from '@aha/common';
import { SLIDE_TYPE } from '../constants';
import type { Group, Participant, PickAttributes, SlideAttributes } from '../types';

interface AudienceContext {
  baseUrl: Ref<string | undefined>;
  slideProps: Ref<Record<string, any> | undefined>;
  presentationProps: Ref<Record<string, any> | undefined>;
  slideAttributes: Ref<Record<string, any> | undefined>;
  audienceId: Ref<string | number | undefined>;
}

/**
 * Audience-side state for the peer picker and reveal.
 *
 * The roster (who can be picked) and the final groups are pushed to the
 * audience by the presenter via slide attributes — the audience iframe never
 * sees anyone's individual picks, only its own selection and, after the reveal,
 * its own group.
 */
export function useAudienceGrouping(ctx: AudienceContext) {
  const attributes = computed<SlideAttributes>(() => (ctx.slideAttributes.value ?? {}) as SlideAttributes);

  const myId = computed(() => (ctx.audienceId.value != null ? String(ctx.audienceId.value) : ''));

  /** Everyone the audience can pick — the roster minus themselves. */
  const pickablePeers = computed<Participant[]>(() =>
    (attributes.value.roster ?? []).filter((p) => p.id !== myId.value),
  );

  const revealed = computed(() => !!attributes.value.revealed && !!attributes.value.groups?.length);

  const myGroup = computed<Group | undefined>(() =>
    attributes.value.groups?.find((g) => g.memberIds.includes(myId.value)),
  );

  /** Group-mates' display participants (self excluded), for the reveal card. */
  const myGroupMates = computed<Participant[]>(() => {
    if (!myGroup.value) return [];
    const roster = attributes.value.roster ?? [];
    return myGroup.value.memberIds
      .filter((id) => id !== myId.value)
      .map((id) => roster.find((p) => p.id === id) ?? { id, name: '', emoji: '🙂' });
  });

  const submitted = ref(false);
  const submitting = ref(false);

  function makeClient(): ApiClient {
    if (!ctx.baseUrl.value) throw new Error('baseUrl is not available');
    return new ApiClient(ctx.baseUrl.value);
  }

  /**
   * Detect an existing submission for this participant on (re)mount and return
   * their real prior picks so the picker can hydrate from them — otherwise
   * "Edit picks" would reopen empty and re-submitting would wipe their choices.
   */
  async function loadExistingSubmission(): Promise<string[]> {
    if (!ctx.baseUrl.value || !myId.value || !ctx.slideProps.value?.id) return [];
    try {
      const prior = await makeClient().getParticipantSubmissions<PickAttributes>({
        audienceId: myId.value,
        slideId: Number(ctx.slideProps.value.id),
        slideVersion: Number(ctx.slideProps.value.version),
        type: SubmissionType.Response,
      });
      if (prior.length > 0) {
        submitted.value = true;
        return prior[0]?.attributes?.pickedPeerIds ?? [];
      }
    } catch (error) {
      console.warn('[preferenceGrouping] could not load prior submission', error);
    }
    return [];
  }

  async function submitPicks(pickedPeerIds: string[]): Promise<void> {
    if (submitting.value) return;
    submitting.value = true;
    try {
      await makeClient().sendLiveSubmission<PickAttributes>(SLIDE_TYPE, {
        presentationId: Number(ctx.presentationProps.value?.id),
        presentationVersion: Number(ctx.presentationProps.value?.version),
        slideId: Number(ctx.slideProps.value?.id),
        slideVersion: Number(ctx.slideProps.value?.version),
        type: SubmissionType.Response,
        senderId: myId.value,
        senderType: SubmissionSenderType.Audience,
        attributes: { pickedPeerIds },
      });
      submitted.value = true;
    } finally {
      submitting.value = false;
    }
  }

  function editPicks(): void {
    submitted.value = false;
  }

  return {
    pickablePeers,
    revealed,
    myGroup,
    myGroupMates,
    submitted,
    submitting,
    loadExistingSubmission,
    submitPicks,
    editPicks,
  };
}
