/**
 * Reference shape of `xprops.presentation` (and the audience `slideAttributes`'
 * sibling presentation object).
 *
 * ⚠️ This is a **best-effort, observed** reference — NOT an authoritative closed
 * type. The host passes the presentation model straight through and no longer
 * maintains a per-field allowlist, so new fields can appear and unused ones can
 * be `null`/absent. Treat it as documentation + optional autocomplete, not a
 * guarantee; hence every field is optional and the index signature stays open.
 *
 * The one nested field the host strips before forwarding is `slides` (the whole
 * deck) — it is large and re-sent on every mutation, so it is never present here.
 *
 * Captured from a real presenter session (v1). Grouped by concern.
 */
export interface PresentationProps {
  // ── Identity & ownership ───────────────────────────────────────────────
  /** Numeric presentation id. */
  id?: number;
  /** Global (cross-region) id, when assigned. */
  globalId?: string | null;
  /** Presentation title. */
  name?: string;
  /** Optional long description. */
  description?: string | null;
  /** Id of the user who created it. */
  userId?: number;
  /** Id of the current owner (may differ from creator after transfer). */
  ownerId?: number;
  /** Billing/account id this deck belongs to. */
  accountId?: number | null;
  /** Containing folder id, or null at root. */
  folderId?: number | null;
  /** Resolved folder object, when expanded. */
  folder?: Record<string, unknown> | null;
  /** Monotonic version of the presentation model. */
  version?: number;
  /** Category links for the public gallery. */
  PresentationsCategories?: unknown[];

  // ── Join / share codes ─────────────────────────────────────────────────
  /** Short human join code shown to the audience (e.g. "KX660"). */
  accessCode?: string;
  /** Stable unique code used in join URLs. */
  uniqueAccessCode?: string;
  /** Timestamped share code for a specific share session. */
  shareCode?: string;
  /** Code for the remote-control pairing. */
  remoteAccessCode?: string;
  /** Code gating moderation access. */
  moderationCode?: string;

  // ── Live session state ─────────────────────────────────────────────────
  /** True while the deck is actively being presented. */
  presenting?: boolean;
  /** Id of the slide currently on screen. */
  activeSlide?: number;
  /** Id of the last slide visited. */
  lastSlide?: number;
  /** Epoch-ms string of when the active slide became active. */
  slideActiveTimestamp?: string | null;
  /** Epoch-ms of the last reset, or null. */
  resetTimeStamp?: string | number | null;
  /** Id of the user who has taken over control. */
  takenOverBy?: number | null;
  /** Current presenting session payload, when present. */
  session?: Record<string, unknown> | null;
  /** Host-issued token for this session, when present. */
  token?: string | null;
  /** Expiry for `token`. */
  expiredToken?: string | null;

  // ── Counts ─────────────────────────────────────────────────────────────
  /** Participants currently online (host tally). */
  onlineCount?: number;
  /** Alternate online counter. */
  userOnline?: number;
  /** Realtime online count from the live channel. */
  realtimeOnlineCount?: number;
  /** Total participants that have joined. */
  participantsCount?: number;
  /** Number of slides in the deck. */
  slideCount?: number;
  /** How many times the deck has been copied. */
  copyCount?: number;
  /** Authentication seats/limit. */
  numberOfAuthens?: number;

  // ── Localization & content ─────────────────────────────────────────────
  /** Deck display language (BCP-47-ish code, e.g. "en"). */
  language?: string;
  /** Deck font family — mirror into the iframe via `ensureHostFontLoaded`. */
  fontFamily?: string;
  /** Free-text tags. */
  tags?: string | string[] | null;
  /** SEO keyword(s) for public decks. */
  keyword?: string | null;
  /** "Who is this for" marketing field. */
  forWho?: string | null;
  /** Call-to-action config for public decks. */
  cta?: Record<string, unknown> | null;

  // ── Pacing & quiz flow ─────────────────────────────────────────────────
  /** Audience-paced mode (each participant advances themselves). */
  audiencePacing?: boolean;
  /** Reveal correct answers only on an explicit presenter action. */
  manualRevealCorrectAnswers?: boolean;
  /** Suppress the "remember the correct answer" reminder. */
  notRemindCorrectAnswer?: boolean;
  /** Show the quiz countdown. */
  enableQuizCoundown?: boolean;
  /** Shuffle answer options per participant. */
  areSlideOptionsShuffling?: boolean | null;
  /** Hide the spinner-wheel entry animation. */
  isHideEntrySpinnerWheen?: boolean | null;

  // ── Audio / music / sound effects ──────────────────────────────────────
  /** Background music enabled. */
  isEnableMusic?: boolean;
  /** Quiz music enabled. */
  isEnableQuizMusic?: boolean;
  /** Sound effects enabled (presenter). */
  isEnableSoundEffects?: boolean;
  /** Sound effects enabled for the audience. */
  isEnableSoundEffectsForAudience?: boolean;
  /** URL of a custom background audio track. */
  audioLink?: string | null;
  /** File name of the custom audio track. */
  audioName?: string | null;

  // ── Reactions ──────────────────────────────────────────────────────────
  /** Live reactions enabled. */
  isReactionEnabled?: boolean;
  numberOfLikes?: number;
  numberOfHearts?: number;
  numberOfLaughs?: number;
  numberOfSads?: number;
  numberOfWows?: number;

  // ── Chat · Q&A · moderation ────────────────────────────────────────────
  /** Audience chat enabled. */
  isEnableChat?: boolean;
  /** Q&A available on all slides. */
  qnaAllSlide?: boolean;
  /** Audience can see all Q&A entries. */
  qnaAudienceShowAll?: boolean;
  /** Q&A submissions are anonymous. */
  qnaAnonymous?: boolean;
  /** Moderation mode on/off (null = unset). */
  isModerationMode?: boolean | null;
  /** Profanity filter setting (null = inherit/disabled). */
  filteringProfanity?: unknown;

  // ── Streak & scoring ───────────────────────────────────────────────────
  isEnableStreakDetection?: boolean;
  isEnableStreakBonus?: boolean;
  isShowSettingStreak?: boolean;
  isShowSettingStreakBonus?: boolean;

  // ── Team play ──────────────────────────────────────────────────────────
  /** Team mode enabled. */
  teamPlay?: boolean;
  /** Number of teams. */
  teamCount?: number;
  /** Max participants per team. */
  teamSize?: number;
  /** How team scores aggregate ("average" | "total" | …). */
  teamScoringRule?: string;
  /** The configured teams. */
  teamData?: Array<{
    id: number;
    name: string;
    /** CSS colour string (often rgba()). */
    color: string;
    visible: boolean;
  }>;

  // ── Audience access & behaviour ────────────────────────────────────────
  /** Admission gate config. */
  audienceAdmission?: { isAudienceAdmission?: boolean; [key: string]: unknown };
  /** Require audience authentication. */
  isAudienceAuthentication?: boolean | null;
  /** A participant cap is in effect. */
  isAudienceLimitation?: boolean;
  /** Don't auto-advance once everyone has answered. */
  isDisableEveryoneHasAnswered?: boolean;
  /** Audience may request to present. */
  enableAudienceRequestPresentation?: boolean | null;
  /** Audience can review slides after the session. */
  isEnableAudienceReviewSlides?: boolean;
  /** Show the "made with AhaSlides" label to the audience. */
  isEnableAudienceAhaSlideLabel?: boolean;

  // ── Branding · visibility · sharing ────────────────────────────────────
  /** Hide the AhaSlides logo. */
  notShowAhaSlidesLogo?: boolean;
  /** Show the AhaSlides CTA. */
  showAhaSlidesCTA?: boolean;
  /** Private (not publicly listed). */
  privateMode?: boolean;
  /** Eligible for public search. */
  isPublicSearch?: boolean | null;
  /** Public source deck reference. */
  publicSource?: unknown;
  /** Crawl source metadata. */
  crawlSource?: unknown;
  /** Allow search-engine indexing. */
  isIndexBot?: boolean | null;
  /** Featured by an admin. */
  isAdminPick?: boolean | null;
  /** Render hyperlinks in content. */
  showHyperLink?: boolean;
  /** Disable presenter-share of the conversation/Q&A. */
  disableConversationPresenterShare?: boolean;
  /** Hide the on-canvas instruction bar. */
  hideInstructionBar?: boolean;
  /** Hide the intro bar in document mode. */
  hideIntroBarDocument?: boolean;
  /** Show the account tab in the editor. */
  isAccountTabVisible?: boolean;
  /** Allow copying slide notes. */
  enableCopySlideNote?: boolean | null;
  /** Resize a custom thumbnail. */
  isResizeCustomThumbnail?: boolean | null;

  // ── Results / ratings / flags ──────────────────────────────────────────
  /** The deck has stored results. */
  hasResults?: boolean;
  /** The deck has example responses seeded. */
  hasExampleResponses?: boolean;
  /** A title was auto-suggested. */
  hasAutoSuggestedTitle?: boolean;
  /** Shared with at least one other user. */
  hasSharedUser?: boolean;
  /** Recently added (UI flag). */
  isNewlyAdded?: boolean | null;
  /** Hide the individual leaderboard. */
  isHideIndividualLeaderboard?: boolean;
  /** Average rating, when rated. */
  avgRating?: number | null;
  /** Total number of ratings. */
  totalRatings?: number | null;

  // ── Source / lifecycle ─────────────────────────────────────────────────
  sourcePresentation?: unknown;
  source?: unknown;
  sender?: unknown;
  publishedAt?: string | null;
  publishedBy?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedById?: number | null;

  // ── Host-DERIVED fields (not on the raw model) ─────────────────────────
  /** Host-derived "session started at" timestamp. Not a raw model field. */
  sessionSince?: number | string | null;
  /** Host-derived share/present state slice. Not a raw model field. */
  sharePresentation?: Record<string, unknown>;

  /** Open record: the host may pass fields not listed above. */
  [key: string]: unknown;
}
