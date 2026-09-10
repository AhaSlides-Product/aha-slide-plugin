/**
 * Reference shape of `xprops.slide` — the active-slide model the host forwards.
 *
 * ⚠️ Best-effort, **observed** reference — NOT an authoritative closed type. The
 * host passes the slide model straight through with no per-field allowlist, so
 * new fields can appear and unused ones can be `null`. Many fields are only
 * meaningful for a particular built-in slide type (word cloud, quiz, audio…) and
 * are `null`/default otherwise. Every field is optional; the index signature
 * stays open. Captured from a real quiz slide (v1). Grouped by concern.
 */
export interface SlideProps {
  // ── Identity & type ────────────────────────────────────────────────────
  /** Numeric slide id. */
  id?: number;
  /** Global (cross-region) id, when assigned. */
  globalId?: string | null;
  /** The slide's declared type. For marketplace slides: `"marketplace/<slug>"`. */
  type?: string;
  /** Host-resolved slide type (e.g. `'multiple-choice'`, `'open-ended'`) — derived, may be null. */
  slideType?: string | null;
  /** Parent presentation id. */
  presentationId?: number;
  /** Position of this slide in the deck (1-based). */
  order?: number;
  /** Monotonic model version — bumped on host reset (re-keys audience locks). */
  version?: number;
  /** Slide this one was copied from, if any. */
  sourceSlideId?: number | null;
  /** User id that created the slide. */
  createdBy?: number;
  /** Soft-delete flags. */
  deleted?: boolean;
  deletedAt?: string | null;
  deletedById?: number | null;
  /** True once the slide has been edited. */
  isTouched?: boolean;
  /** Whether the slide is a public template. */
  isPublicTemplate?: boolean | null;
  createdAt?: string;
  updatedAt?: string;

  // ── Title & content ────────────────────────────────────────────────────
  /** The question/title (plain). */
  title?: string | null;
  /** The title as HTML. */
  titleHTML?: string | null;
  /** Sanitised title / title HTML (host-processed). */
  sanitizedTitle?: string | null;
  sanitizedTitleHTML?: string | null;
  /** Rich body HTML (content slides). */
  bodyHTML?: string | null;
  /** Subheading text. */
  subheading?: string | null;
  /** Secondary title/description line. */
  titleDesc?: string | null;
  /** Long description. */
  description?: string | null;
  /** Presenter notes. */
  notes?: string | null;
  /** Text alignment (`'left'` | `'center'` | `'right'`). */
  textAlign?: string;

  // ── Resolved theme (host-merged) ───────────────────────────────────────
  /** Resolved primary text colour (CSS string). Slide override merged over deck theme. */
  textColour?: string;
  /** Resolved background colour (CSS string). */
  baseColour?: string;
  /** Resolved background image URL (host projects the largest size). */
  backgroundImage?: string | null;
  /** Background sizing mode. */
  backgroundSize?: string | null;
  /** Palette of random colours the slide may use. */
  randomColours?: string[];

  // ── Images ─────────────────────────────────────────────────────────────
  /** Current question image URL. */
  image?: string | null;
  /** Original (pre-crop) question / background image URLs. */
  originQuestionImage?: string | null;
  originBackgroundImage?: string | null;
  /** Layout of the question image (`'default'`, …). */
  questionImageLayout?: string;
  /** Whether to show the question image. */
  showQuestionImage?: boolean;
  /** Image type (`'default'`, …). */
  imageType?: string;
  /** Caption under the image. */
  imageCaption?: string | null;
  /** Whether the audience may submit an image as their answer. */
  imageSubmission?: boolean;
  /** Cropper state for question / background images. */
  questionImageCropperData?: unknown;
  backgroundImageCropperData?: unknown;
  /** URL of a canvas-blocks layout, when used. */
  canvasBlocksUrl?: string | null;
  /** Thumbnail for a content template. */
  contentTemplateThumbnail?: string | null;

  // ── Audio ──────────────────────────────────────────────────────────────
  /** Custom audio track URL / name. */
  audioLink?: string | null;
  audioName?: string | null;
  /** Presenter audio controls. */
  audioShowControl?: boolean;
  audioAutoPlay?: boolean;
  audioRepeat?: boolean | null;
  audioPlayOnAudience?: boolean | null;
  audioVolume?: number | null;
  audioMuted?: boolean | null;
  /** Audience-side audio controls. */
  audioAudienceShowControl?: boolean;
  audioAudienceAutoPlay?: boolean;
  audioAudienceRepeat?: boolean | null;
  /** Text-to-speech / voice active. */
  voiceActive?: boolean | null;

  // ── Video / embeds ─────────────────────────────────────────────────────
  /** YouTube link and its iframe toggle. */
  youtubeLink?: string | null;
  showYouTubeIframe?: boolean | null;
  /** Generic iframe embed toggle. */
  showIframe?: boolean;
  /** Published external link. */
  publishedLink?: string | null;
  /** Imported Google Slide reference. */
  googleSlide?: unknown;

  // ── Quiz / answering ───────────────────────────────────────────────────
  /** Current voting phase (e.g. `'submission'`). */
  votingStep?: string;
  /** Multiple-choice mode on. */
  multipleChoice?: boolean;
  /** Max selectable options in multi-select. */
  limitChoice?: number;
  /** Max entries a single participant may submit. */
  entriesPerParticipant?: number;
  /** Answer time limit (seconds). */
  timeToAnswer?: number;
  /** Whether the time limit is enforced. */
  hasTimeLimit?: boolean;
  /** Faster answers score more. */
  fastAnswerGetMorePoint?: boolean;
  /**
   * Quiz lifecycle phase (host-computed). Common mapping:
   * 1 = Lobby, 2 = Rule, 3 = Countdown, 4 = Question, 5 = Result.
   * `undefined` for non-quiz slides.
   */
  quizStatus?: number;
  /** 1-based index of this question and total questions. */
  questionIndex?: number;
  questionCount?: number;
  /** Per-phase timestamps for the quiz. */
  quizTimestamp?: unknown[];
  timestampLeaderboard?: string | number | null;
  /** Correct answers award points. */
  isCorrectGetPoint?: boolean;
  /** Score bounds. */
  maxPoint?: number;
  minPoint?: number;
  /** Whether a correct option has been added / should be shown. */
  addCorrectOption?: boolean;
  showCorrectOption?: boolean | null;
  /** Alternative accepted answers (open-ended quiz). */
  otherCorrectQuiz?: unknown;
  correctQuizTypeAnswer?: unknown;
  /** Options for a matching-question slide. */
  matchingQuestionOptions?: unknown;
  /** Submission gate: closed when set, with a close timestamp. */
  stopSubmission?: boolean | null;
  stopSubmissionTime?: number;
  /** Epoch-ms of the last reset (re-keys the audience submission lock). */
  resetTimeStamp?: string | number | null;
  /** Epoch-ms this slide became active. */
  slideTimestamp?: string | null;
  /** Cached leaderboard URL, when precomputed. */
  cacheLeaderboardUrl?: string;

  // ── Display & results ──────────────────────────────────────────────────
  /** Chart used for results (`'barChart'`, `'pieChart'`, …). */
  typeChart?: string;
  /** Answer layout (`'grid'`, `'list'`, …). */
  layout?: string;
  /** Hide the result view. */
  hideResult?: boolean;
  /** Show results as percentages. */
  showPercentage?: boolean;
  /** Show vote / submission counts. */
  showVotes?: boolean;
  showSubmissions?: boolean;
  /** Reveal results on the audience screen. */
  showVotingResultsOnAudience?: boolean | null;
  /** Slide visibility flag (host enum). */
  visibility?: number;
  /** Scale-question config. */
  scale?: unknown;
  /** Bullet-point reveal state. */
  showAllBulletPoints?: boolean | null;
  bulletPointsIndex?: number | null;
  /** Hint reveal state. */
  hintsShowingIndex?: number | null;
  numberOfHintsShown?: number | null;
  isHintsVisible?: boolean | null;
  hints?: unknown[];

  // ── Options & data ─────────────────────────────────────────────────────
  /** The slide's answer options. */
  SlideOptions?: unknown[];
  /** Count of ideas/submissions (brainstorm-style slides). */
  ideasCount?: number;
  /** Count of multiple answers. */
  multipleCountAnswer?: number;
  /** Slide-type-specific extra fields. */
  additionalFields?: unknown;
  /** Arbitrary host/slide metadata bag. */
  metadata?: Record<string, unknown>;

  // ── Word cloud / AI grouping ───────────────────────────────────────────
  wordCloudSmartGrouping?: unknown;
  numberOfWordsInGroup?: number;
  numberOfUniqueWordsInGroup?: number;
  lastTimeGroupWordCloud?: string | null;
  isGroupWordCloudWords?: boolean;
  hasUserGroupedWords?: boolean;
  openEndedAIGroupedAnswers?: unknown;
  openEndedMultipleOption?: unknown;

  // ── AI assistant ───────────────────────────────────────────────────────
  /** AI bot chat messages attached to the slide. */
  aiBotMessages?: unknown[];
  /** Whether the AI indicator is visible. */
  isAIIndicatorVisible?: boolean;

  // ── Host-derived extras (not on the raw model) ─────────────────────────
  /** Host-computed: whether a leaderboard slide follows this one. */
  hasLeaderboardSlide?: boolean;

  /** Open record: the host may pass fields not listed above. */
  [key: string]: unknown;
}
