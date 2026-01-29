<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">  
  <div class="p-8 bg-base-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">AhaSlides Icons Set</h1>
      <p class="text-base-70">All custom SVG icons loaded via unplugin-icons from @aha/ui package</p>
    </div>

    <!-- Usage Documentation -->
    <div class="mb-10 p-6 bg-white rounded-xl shadow-xs border border-base-20">
      <h2 class="text-2xl font-bold mb-6 text-base-100 flex items-center gap-2">
        <span>📚</span> Developer Guide
      </h2>

      <div class="space-y-8">
        <!-- Prerequisites -->
        <div>
          <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">Prerequisites</h3>
          <p class="text-base-70 mb-3">To enable icon imports using the <code>~icons/aha/*</code> syntax, you need to add the Aha Icon Vite plugin to your project configuration.</p>
          <div class="bg-base-5 p-4 rounded-lg border border-base-10 font-mono text-sm text-base-80 overflow-x-auto">
            <div><span class="text-base-50">// vite.config.ts</span></div>
            <div><span class="text-primary-80">import</span> { ahaViteIconPlugin } <span class="text-primary-80">from</span> <span class="text-emerald-70">'@aha/ui/vite.config.icon'</span>;</div>
            <br />
            <div><span class="text-primary-80">export default</span> defineConfig({</div>
            <div>  plugins: [</div>
            <div>    <span class="text-base-50">// ... other plugins</span></div>
            <div>    ahaViteIconPlugin,</div>
            <div>  ],</div>
            <div>});</div>
          </div>
        </div>

        <!-- Step 1 -->
        <div>
          <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">1. Import the icon</h3>
          <p class="text-base-70 mb-3">Import icons directly from the <code class="bg-base-10 px-1 rounded text-primary-90">~icons/aha</code> collection.</p>
          <div class="bg-base-5 p-4 rounded-lg border border-base-10 font-mono text-sm text-base-80">
            <span class="text-primary-80">import</span> IconAhaStar <span class="text-primary-80">from</span> <span class="text-emerald-70">'~icons/aha/aha-star'</span>;
          </div>
        </div>

        <!-- Step 2 -->
        <div>
          <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">2. Basic Usage</h3>
          <p class="text-base-70 mb-3">Use the component directly in your template.</p>
          <div class="bg-base-5 p-4 rounded-lg border border-base-10 font-mono text-sm text-base-80">
            {{ '<IconAhaStar />' }}
          </div>
        </div>

        <!-- Step 3 -->
        <div>
          <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">3. Customization</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sizing -->
            <div>
              <p class="text-sm font-bold text-base-80 mb-2 uppercase tracking-wide">Sizing</p>
              <p class="text-sm text-base-60 mb-2">Control size via props or utility classes.</p>
              <div class="bg-base-5 p-3 rounded-lg border border-base-10 font-mono text-xs text-base-80">
                 {{ '<IconAhaStar width="24" height="24" />' }}
              </div>
            </div>
            <!-- Coloring -->
            <div>
              <p class="text-sm font-bold text-base-80 mb-2 uppercase tracking-wide">Coloring</p>
              <p class="text-sm text-base-60 mb-2">Icons inherit color (currentColor) by default.</p>
              <div class="bg-base-5 p-3 rounded-lg border border-base-10 font-mono text-xs text-base-80">
                {{ '<IconAhaStar class="text-red-500" />' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div>
           <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">4. Ant Design Integration</h3>
           <p class="text-base-70 mb-3">Example usage within an <code>a-button</code>.</p>
           <div class="bg-base-5 p-4 rounded-lg border border-base-10 font-mono text-sm text-base-80 whitespace-pre overflow-x-auto">
{{ `<a-button>
  <template #icon>
    <IconAhaStar />
  </template>
  Star Button
</a-button>` }}
           </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search icons by name..."
        size="large"
        allow-clear
        class="flex-1"
        style="max-width: 500px"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input-search>
    </div>
    

    <!-- Icon Grid -->
    <div class="bg-white rounded-xl p-8 shadow-lg border border-base-20">
      <div v-if="filteredIcons.length > 0" class="flex flex-wrap gap-3">
        <a-tooltip
          v-for="icon in filteredIcons"
          :key="icon.name"
          :title="`Click to copy: ${icon.name}`"
          placement="top"
        >
          <div
            class="icon-card"
            @click="copyIconImport(icon.name)"
          >
            <div class="icon-wrapper">
              <component :is="icon.component" class="icon text-primary-90" />
            </div>
            <span class="icon-name">{{ icon.displayName }}</span>
          </div>
        </a-tooltip>
      </div>

      <!-- Empty state -->
      <a-empty v-if="filteredIcons.length === 0" description="No icons found">
        <a-button type="primary" @click="searchQuery = ''">Clear Search</a-button>
      </a-empty>
    </div>
  </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  SearchOutlined, 
} from '@ant-design/icons-vue';
import { ahaSlidesDefaultTheme } from '@aha/ui';

// Import all icons dynamically
import IconAhaAlignCenter from '~icons/aha/aha-align-center';
import IconAhaAlignLeft from '~icons/aha/aha-align-left';
import IconAhaAlignRight from '~icons/aha/aha-align-right';
import IconAhaAnimation from '~icons/aha/aha-animation';
import IconAhaArrowClockwise from '~icons/aha/aha-arrow-clockwise';
import IconAhaArrowCounterClockwise from '~icons/aha/aha-arrow-counter-clockwise';
import IconAhaArrowDown from '~icons/aha/aha-arrow-down';
import IconAhaArrowLeft from '~icons/aha/aha-arrow-left';
import IconAhaArrowRightBig from '~icons/aha/aha-arrow-right-big';
import IconAhaArrowLeftBig from '~icons/aha/aha-arrow-left-big';
import IconAhaArrowDownBig from '~icons/aha/aha-arrow-down-big';
import IconAhaArrowUpBig from '~icons/aha/aha-arrow-up-big';
import IconAhaArrowRight from '~icons/aha/aha-arrow-right';
import IconAhaArrowSquareOut from '~icons/aha/aha-arrow-square-out';
import IconAhaArrowUUpLeft from '~icons/aha/aha-arrow-u-up-left';
import IconAhaArrowUUpRight from '~icons/aha/aha-arrow-u-up-right';
import IconAhaArrowUp from '~icons/aha/aha-arrow-up';
import IconAhaArrowsClockwise from '~icons/aha/aha-arrows-clockwise';
import IconAhaArrowsDownUp from '~icons/aha/aha-arrows-down-up';
import IconAhaArrowsInSimple from '~icons/aha/aha-arrows-in-simple';
import IconAhaArrowsLeftRight from '~icons/aha/aha-arrows-left-right';
import IconAhaArrowsOutCardinal from '~icons/aha/aha-arrows-out-cardinal';
import IconAhaArrowsOutSimple from '~icons/aha/aha-arrows-out-simple';
import IconAhaAsterisk from '~icons/aha/aha-asterisk';
import IconAhaBackstage from '~icons/aha/aha-backstage';
import IconAhaBell from '~icons/aha/aha-bell';
import IconAhaBook from '~icons/aha/aha-book';
import IconAhaBookmarkSimple from '~icons/aha/aha-bookmark-simple';
import IconAhaBriefcase from '~icons/aha/aha-briefcase';
import IconAhaCalendarDot from '~icons/aha/aha-calendar-dot';
import IconAhaCalendarDots from '~icons/aha/aha-calendar-dots';
import IconAhaCardsThree from '~icons/aha/aha-cards-three';
import IconAhaCaretDown from '~icons/aha/aha-caret-down';
import IconAhaCaretLeft from '~icons/aha/aha-caret-left';
import IconAhaCaretRight from '~icons/aha/aha-caret-right';
import IconAhaCaretUp from '~icons/aha/aha-caret-up';
import IconAhaChartBar from '~icons/aha/aha-chart-bar';
import IconAhaChartDonut from '~icons/aha/aha-chart-donut';
import IconAhaChartLineUp from '~icons/aha/aha-chart-line-up';
import IconAhaChartPie from '~icons/aha/aha-chart-pie';
import IconAhaChatAdd from '~icons/aha/aha-chat-add';
import IconAhaChatCenteredText from '~icons/aha/aha-chat-centered-text';
import IconAhaChatCircle from '~icons/aha/aha-chat-circle';
import IconAhaChatText from '~icons/aha/aha-chat-text';
import IconAhaChatsCircle from '~icons/aha/aha-chats-circle';
import IconAhaCheckCircle from '~icons/aha/aha-check-circle';
import IconAhaCheck from '~icons/aha/aha-check';
import IconAhaCircleNotch from '~icons/aha/aha-circle-notch';
import IconAhaConfetti from '~icons/aha/aha-confetti';
import IconAhaCopy from '~icons/aha/aha-copy';
import IconAhaCreditCard from '~icons/aha/aha-credit-card';
import IconAhaCurrencyCircleDollar from '~icons/aha/aha-currency-circle-dollar';
import IconAhaCursorClick from '~icons/aha/aha-cursor-click';
import IconAhaDeviceMobile from '~icons/aha/aha-device-mobile';
import IconAhaDocumentCheck from '~icons/aha/aha-document-check';
import IconAhaDotsThreeVertical from '~icons/aha/aha-dots-three-vertical';
import IconAhaDotsThree from '~icons/aha/aha-dots-three';
import IconAhaDownloadSimple from '~icons/aha/aha-download-simple';
import IconAhaDrag from '~icons/aha/aha-drag';
import IconAhaDrum from '~icons/aha/aha-drum';
import IconAhaDuplicate from '~icons/aha/aha-duplicate';
import IconAhaEmojiBubble from '~icons/aha/aha-emoji-bubble';
import IconAhaEnvelop from '~icons/aha/aha-envelop';
import IconAhaEnvelope from '~icons/aha/aha-envelope';
import IconAhaEquation from '~icons/aha/aha-equation';
import IconAhaExclamationMark from '~icons/aha/aha-exclamation-mark';
import IconAhaExport from '~icons/aha/aha-export';
import IconAhaEyeSlash from '~icons/aha/aha-eye-slash';
import IconAhaEye from '~icons/aha/aha-eye';
import IconAhaFileArrowDown from '~icons/aha/aha-file-arrow-down';
import IconAhaFileArrowIn from '~icons/aha/aha-file-arrow-in';
import IconAhaFileArrowUp from '~icons/aha/aha-file-arrow-up';
import IconAhaFileAudio from '~icons/aha/aha-file-audio';
import IconAhaFileCheck from '~icons/aha/aha-file-check';
import IconAhaFileXls from '~icons/aha/aha-file-xls';
import IconAhaFile from '~icons/aha/aha-file';
import IconAhaFolder2 from '~icons/aha/aha-folder-2';
import IconAhaFolderSimpleArrow from '~icons/aha/aha-folder-simple-arrow';
import IconAhaFolderSimplePlus from '~icons/aha/aha-folder-simple-plus';
import IconAhaFolderUser from '~icons/aha/aha-folder-user';
import IconAhaFolder from '~icons/aha/aha-folder';
import IconAhaForm from '~icons/aha/aha-form';
import IconAhaFrameCorners from '~icons/aha/aha-frame-corners';
import IconAhaGear from '~icons/aha/aha-gear';
import IconAhaGif from '~icons/aha/aha-gif';
import IconAhaGlobeSimple from '~icons/aha/aha-globe-simple';
import IconAhaGridComplex from '~icons/aha/aha-grid-complex';
import IconAhaHandPointing from '~icons/aha/aha-hand-pointing';
import IconAhaHand from '~icons/aha/aha-hand';
import IconAhaHandsClapping from '~icons/aha/aha-hands-clapping';
import IconAhaHeartStraight from '~icons/aha/aha-heart-straight';
import IconAhaHourglassHigh from '~icons/aha/aha-hourglass-high';
// Additional icons used in examples
import IconAhaStar from '~icons/aha/aha-star';
import IconAhaFire from '~icons/aha/aha-fire';
import IconAhaGift from '~icons/aha/aha-gift';
import IconAhaSparkle from '~icons/aha/aha-sparkle';
import IconAhaHouse from '~icons/aha/aha-house';
import IconAhaIdentificationCard from '~icons/aha/aha-identification-card';
import IconAhaImageSquare from '~icons/aha/aha-image-square';
import IconAhaImages from '~icons/aha/aha-images';
import IconAhaInfo from '~icons/aha/aha-info';
import IconAhaInvoice from '~icons/aha/aha-invoice';
import IconAhaKSquare from '~icons/aha/aha-k-square';
import IconAhaKeyReturn from '~icons/aha/aha-key-return';
import IconAhaLayout from '~icons/aha/aha-layout';
import IconAhaLightbulbFilament from '~icons/aha/aha-lightbulb-filament';
import IconAhaLineWeight from '~icons/aha/aha-line-weight';
import IconAhaLink from '~icons/aha/aha-link';
import IconAhaList1 from '~icons/aha/aha-list-1';
import IconAhaListNumbers from '~icons/aha/aha-list-numbers';
import IconAhaList from '~icons/aha/aha-list';
import IconAhaLockOpen from '~icons/aha/aha-lock-open';
import IconAhaLock from '~icons/aha/aha-lock';
import IconAhaMagicWand from '~icons/aha/aha-magic-wand';
import IconAhaMagnifyingGlass from '~icons/aha/aha-magnifying-glass';
import IconAhaMicrophone from '~icons/aha/aha-microphone';
import IconAhaMicrosoftExcelLogo from '~icons/aha/aha-microsoft-excel-logo';
import IconAhaMinusSquare from '~icons/aha/aha-minus-square';
import IconAhaMinus from '~icons/aha/aha-minus';
import IconAhaMoneyBack from '~icons/aha/aha-money-back';
import IconAhaMusicNotesSimple from '~icons/aha/aha-music-notes-simple';
import IconAhaMusicNotes from '~icons/aha/aha-music-notes';
import IconAhaNoteFilled from '~icons/aha/aha-note-filled';
import IconAhaNote from '~icons/aha/aha-note';
import IconAhaNumberOne from '~icons/aha/aha-number-one';
import IconAhaPalette from '~icons/aha/aha-palette';
import IconAhaPaperClip from '~icons/aha/aha-paper-clip';
import IconAhaPaste from '~icons/aha/aha-paste';
import IconAhaPause from '~icons/aha/aha-pause';
import IconAhaPencilSimpleLine from '~icons/aha/aha-pencil-simple-line';
import IconAhaPencilSimple from '~icons/aha/aha-pencil-simple';
import IconAhaPercent from '~icons/aha/aha-percent';
import IconAhaPinnedFilled from '~icons/aha/aha-pinned-filled';
import IconAhaPlan from '~icons/aha/aha-plan';
import IconAhaPlay from '~icons/aha/aha-play';
import IconAhaPlusSquare from '~icons/aha/aha-plus-square';
import IconAhaPlus from '~icons/aha/aha-plus';
import IconAhaPresentationChartOne from '~icons/aha/aha-presentation-chart-one';
import IconAhaPresentationChart from '~icons/aha/aha-presentation-chart';
import IconAhaPresentationConnect from '~icons/aha/aha-presentation-connect';
import IconAhaPresentationDisconnect from '~icons/aha/aha-presentation-disconnect';
import IconAhaProjectorScreenChart from '~icons/aha/aha-projector-screen-chart';
import IconAhaPushPin from '~icons/aha/aha-push-pin';
import IconAhaQA from '~icons/aha/aha-q&a';
import IconAhaQrCode from '~icons/aha/aha-qr-code';
import IconAhaQuestion from '~icons/aha/aha-question';
import IconAhaRemote from '~icons/aha/aha-remote';
import IconAhaRows from '~icons/aha/aha-rows';
import IconAhaScissors from '~icons/aha/aha-scissors';
import IconAhaShapes from '~icons/aha/aha-shapes';
import IconAhaShareNetwork from '~icons/aha/aha-share-network';
import IconAhaShieldCheck from '~icons/aha/aha-shield-check';
import IconAhaShieldWarning from '~icons/aha/aha-shield-warning';
import IconAhaShuffle from '~icons/aha/aha-shuffle';
import IconAhaSignOut from '~icons/aha/aha-sign-out';
import IconAhaSlidersHorizontal from '~icons/aha/aha-sliders-horizontal';
import IconAhaSmiley from '~icons/aha/aha-smiley';
import IconAhaSpeakerSimpleHigh from '~icons/aha/aha-speaker-simple-high';
import IconAhaSpeakerSimpleX from '~icons/aha/aha-speaker-simple-x';
import IconAhaSquareSplitHorizontal from '~icons/aha/aha-square-split-horizontal';
import IconAhaSquaresFour from '~icons/aha/aha-squares-four';
import IconAhaStackSimple from '~icons/aha/aha-stack-simple';
import IconAhaStack from '~icons/aha/aha-stack';
import IconAhaStop from '~icons/aha/aha-stop';
import IconAhaTable from '~icons/aha/aha-table';
import IconAhaTextT from '~icons/aha/aha-text-t';
import IconAhaThumbsDown from '~icons/aha/aha-thumbs-down';
import IconAhaThumbsUp from '~icons/aha/aha-thumbs-up';
import IconAhaTimer from '~icons/aha/aha-timer';
import IconAhaTrash from '~icons/aha/aha-trash';
import IconAhaTrendDown from '~icons/aha/aha-trend-down';
import IconAhaTrendUp from '~icons/aha/aha-trend-up';
import IconAhaTrophySlash from '~icons/aha/aha-trophy-slash';
import IconAhaTrophy from '~icons/aha/aha-trophy';
import IconAhaUploadSimple from '~icons/aha/aha-upload-simple';
import IconAhaUserCircle from '~icons/aha/aha-user-circle';
import IconAhaUserPlus from '~icons/aha/aha-user-plus';
import IconAhaUser from '~icons/aha/aha-user';
import IconAhaUsersThree from '~icons/aha/aha-users-three';
import IconAhaUsers from '~icons/aha/aha-users';
import IconAhaVideo from '~icons/aha/aha-video';
import IconAhaWallet from '~icons/aha/aha-wallet';
import IconAhaWarningCircle from '~icons/aha/aha-warning-circle';
import IconAhaWhatsappLogo from '~icons/aha/aha-whatsapp-logo';
import IconAhaXCircle from '~icons/aha/aha-x-circle';
import IconAhaX from '~icons/aha/aha-x';

// Search state
const searchQuery = ref('');

// Icons list
const icons = ref([
  { name: 'aha-align-center', component: IconAhaAlignCenter, displayName: 'AlignCenter' },
  { name: 'aha-align-left', component: IconAhaAlignLeft, displayName: 'AlignLeft' },
  { name: 'aha-align-right', component: IconAhaAlignRight, displayName: 'AlignRight' },
  { name: 'aha-animation', component: IconAhaAnimation, displayName: 'Animation' },
  { name: 'aha-arrow-clockwise', component: IconAhaArrowClockwise, displayName: 'ArrowClockwise' },
  { name: 'aha-arrow-counter-clockwise', component: IconAhaArrowCounterClockwise, displayName: 'ArrowCounterClockwise' },
  { name: 'aha-arrow-down', component: IconAhaArrowDown, displayName: 'ArrowDown' },
  { name: 'aha-arrow-down-big', component: IconAhaArrowDownBig, displayName: 'ArrowDownBig' },
  { name: 'aha-arrow-left', component: IconAhaArrowLeft, displayName: 'ArrowLeft' },
  { name: 'aha-arrow-left-big', component: IconAhaArrowLeftBig, displayName: 'ArrowLeftBig' },
  { name: 'aha-arrow-right-big', component: IconAhaArrowRightBig, displayName: 'ArrowRightBig' },
  { name: 'aha-arrow-right', component: IconAhaArrowRight, displayName: 'ArrowRight' },
  { name: 'aha-arrow-square-out', component: IconAhaArrowSquareOut, displayName: 'ArrowSquareOut' },
  { name: 'aha-arrow-u-up-left', component: IconAhaArrowUUpLeft, displayName: 'ArrowUUpLeft' },
  { name: 'aha-arrow-u-up-right', component: IconAhaArrowUUpRight, displayName: 'ArrowUUpRight' },
  { name: 'aha-arrow-up', component: IconAhaArrowUp, displayName: 'ArrowUp' },
  { name: 'aha-arrow-up-big', component: IconAhaArrowUpBig, displayName: 'ArrowUpBig' },
  { name: 'aha-arrows-clockwise', component: IconAhaArrowsClockwise, displayName: 'ArrowsClockwise' },
  { name: 'aha-arrows-down-up', component: IconAhaArrowsDownUp, displayName: 'ArrowsDownUp' },
  { name: 'aha-arrows-in-simple', component: IconAhaArrowsInSimple, displayName: 'ArrowsInSimple' },
  { name: 'aha-arrows-left-right', component: IconAhaArrowsLeftRight, displayName: 'ArrowsLeftRight' },
  { name: 'aha-arrows-out-cardinal', component: IconAhaArrowsOutCardinal, displayName: 'ArrowsOutCardinal' },
  { name: 'aha-arrows-out-simple', component: IconAhaArrowsOutSimple, displayName: 'ArrowsOutSimple' },
  { name: 'aha-asterisk', component: IconAhaAsterisk, displayName: 'Asterisk' },
  { name: 'aha-backstage', component: IconAhaBackstage, displayName: 'Backstage' },
  { name: 'aha-bell', component: IconAhaBell, displayName: 'Bell' },
  { name: 'aha-book', component: IconAhaBook, displayName: 'Book' },
  { name: 'aha-bookmark-simple', component: IconAhaBookmarkSimple, displayName: 'BookmarkSimple' },
  { name: 'aha-briefcase', component: IconAhaBriefcase, displayName: 'Briefcase' },
  { name: 'aha-calendar-dot', component: IconAhaCalendarDot, displayName: 'CalendarDot' },
  { name: 'aha-calendar-dots', component: IconAhaCalendarDots, displayName: 'CalendarDots' },
  { name: 'aha-cards-three', component: IconAhaCardsThree, displayName: 'CardsThree' },
  { name: 'aha-caret-down', component: IconAhaCaretDown, displayName: 'CaretDown' },
  { name: 'aha-caret-left', component: IconAhaCaretLeft, displayName: 'CaretLeft' },
  { name: 'aha-caret-right', component: IconAhaCaretRight, displayName: 'CaretRight' },
  { name: 'aha-caret-up', component: IconAhaCaretUp, displayName: 'CaretUp' },
  { name: 'aha-chart-bar', component: IconAhaChartBar, displayName: 'ChartBar' },
  { name: 'aha-chart-donut', component: IconAhaChartDonut, displayName: 'ChartDonut' },
  { name: 'aha-chart-line-up', component: IconAhaChartLineUp, displayName: 'ChartLineUp' },
  { name: 'aha-chart-pie', component: IconAhaChartPie, displayName: 'ChartPie' },
  { name: 'aha-chat-add', component: IconAhaChatAdd, displayName: 'ChatAdd' },
  { name: 'aha-chat-centered-text', component: IconAhaChatCenteredText, displayName: 'ChatCenteredText' },
  { name: 'aha-chat-circle', component: IconAhaChatCircle, displayName: 'ChatCircle' },
  { name: 'aha-chat-text', component: IconAhaChatText, displayName: 'ChatText' },
  { name: 'aha-chats-circle', component: IconAhaChatsCircle, displayName: 'ChatsCircle' },
  { name: 'aha-check-circle', component: IconAhaCheckCircle, displayName: 'CheckCircle' },
  { name: 'aha-check', component: IconAhaCheck, displayName: 'Check' },
  { name: 'aha-circle-notch', component: IconAhaCircleNotch, displayName: 'CircleNotch' },
  { name: 'aha-confetti', component: IconAhaConfetti, displayName: 'Confetti' },
  { name: 'aha-copy', component: IconAhaCopy, displayName: 'Copy' },
  { name: 'aha-credit-card', component: IconAhaCreditCard, displayName: 'CreditCard' },
  { name: 'aha-currency-circle-dollar', component: IconAhaCurrencyCircleDollar, displayName: 'CurrencyCircleDollar' },
  { name: 'aha-cursor-click', component: IconAhaCursorClick, displayName: 'CursorClick' },
  { name: 'aha-device-mobile', component: IconAhaDeviceMobile, displayName: 'DeviceMobile' },
  { name: 'aha-document-check', component: IconAhaDocumentCheck, displayName: 'DocumentCheck' },
  { name: 'aha-dots-three-vertical', component: IconAhaDotsThreeVertical, displayName: 'DotsThreeVertical' },
  { name: 'aha-dots-three', component: IconAhaDotsThree, displayName: 'DotsThree' },
  { name: 'aha-download-simple', component: IconAhaDownloadSimple, displayName: 'DownloadSimple' },
  { name: 'aha-drag', component: IconAhaDrag, displayName: 'Drag' },
  { name: 'aha-drum', component: IconAhaDrum, displayName: 'Drum' },
  { name: 'aha-duplicate', component: IconAhaDuplicate, displayName: 'Duplicate' },
  { name: 'aha-emoji-bubble', component: IconAhaEmojiBubble, displayName: 'EmojiBubble' },
  { name: 'aha-envelop', component: IconAhaEnvelop, displayName: 'Envelop' },
  { name: 'aha-envelope', component: IconAhaEnvelope, displayName: 'Envelope' },
  { name: 'aha-equation', component: IconAhaEquation, displayName: 'Equation' },
  { name: 'aha-exclamation-mark', component: IconAhaExclamationMark, displayName: 'ExclamationMark' },
  { name: 'aha-export', component: IconAhaExport, displayName: 'Export' },
  { name: 'aha-eye-slash', component: IconAhaEyeSlash, displayName: 'EyeSlash' },
  { name: 'aha-eye', component: IconAhaEye, displayName: 'Eye' },
  { name: 'aha-file-arrow-down', component: IconAhaFileArrowDown, displayName: 'FileArrowDown' },
  { name: 'aha-file-arrow-in', component: IconAhaFileArrowIn, displayName: 'FileArrowIn' },
  { name: 'aha-file-arrow-up', component: IconAhaFileArrowUp, displayName: 'FileArrowUp' },
  { name: 'aha-file-audio', component: IconAhaFileAudio, displayName: 'FileAudio' },
  { name: 'aha-file-check', component: IconAhaFileCheck, displayName: 'FileCheck' },
  { name: 'aha-file-xls', component: IconAhaFileXls, displayName: 'FileXls' },
  { name: 'aha-file', component: IconAhaFile, displayName: 'File' },
  { name: 'aha-fire', component: IconAhaFire, displayName: 'Fire' },
  { name: 'aha-folder-2', component: IconAhaFolder2, displayName: 'Folder2' },
  { name: 'aha-folder-simple-arrow', component: IconAhaFolderSimpleArrow, displayName: 'FolderSimpleArrow' },
  { name: 'aha-folder-simple-plus', component: IconAhaFolderSimplePlus, displayName: 'FolderSimplePlus' },
  { name: 'aha-folder-user', component: IconAhaFolderUser, displayName: 'FolderUser' },
  { name: 'aha-folder', component: IconAhaFolder, displayName: 'Folder' },
  { name: 'aha-form', component: IconAhaForm, displayName: 'Form' },
  { name: 'aha-frame-corners', component: IconAhaFrameCorners, displayName: 'FrameCorners' },
  { name: 'aha-gear', component: IconAhaGear, displayName: 'Gear' },
  { name: 'aha-gif', component: IconAhaGif, displayName: 'Gif' },
  { name: 'aha-gift', component: IconAhaGift, displayName: 'Gift' },
  { name: 'aha-globe-simple', component: IconAhaGlobeSimple, displayName: 'GlobeSimple' },
  { name: 'aha-grid-complex', component: IconAhaGridComplex, displayName: 'GridComplex' },
  { name: 'aha-hand-pointing', component: IconAhaHandPointing, displayName: 'HandPointing' },
  { name: 'aha-hand', component: IconAhaHand, displayName: 'Hand' },
  { name: 'aha-hands-clapping', component: IconAhaHandsClapping, displayName: 'HandsClapping' },
  { name: 'aha-heart-straight', component: IconAhaHeartStraight, displayName: 'HeartStraight' },
  { name: 'aha-hourglass-high', component: IconAhaHourglassHigh, displayName: 'HourglassHigh' },
  { name: 'aha-house', component: IconAhaHouse, displayName: 'House' },
  { name: 'aha-identification-card', component: IconAhaIdentificationCard, displayName: 'IdentificationCard' },
  { name: 'aha-image-square', component: IconAhaImageSquare, displayName: 'ImageSquare' },
  { name: 'aha-images', component: IconAhaImages, displayName: 'Images' },
  { name: 'aha-info', component: IconAhaInfo, displayName: 'Info' },
  { name: 'aha-invoice', component: IconAhaInvoice, displayName: 'Invoice' },
  { name: 'aha-k-square', component: IconAhaKSquare, displayName: 'KSquare' },
  { name: 'aha-key-return', component: IconAhaKeyReturn, displayName: 'KeyReturn' },
  { name: 'aha-layout', component: IconAhaLayout, displayName: 'Layout' },
  { name: 'aha-lightbulb-filament', component: IconAhaLightbulbFilament, displayName: 'LightbulbFilament' },
  { name: 'aha-line-weight', component: IconAhaLineWeight, displayName: 'LineWeight' },
  { name: 'aha-link', component: IconAhaLink, displayName: 'Link' },
  { name: 'aha-list-1', component: IconAhaList1, displayName: 'List1' },
  { name: 'aha-list-numbers', component: IconAhaListNumbers, displayName: 'ListNumbers' },
  { name: 'aha-list', component: IconAhaList, displayName: 'List' },
  { name: 'aha-lock-open', component: IconAhaLockOpen, displayName: 'LockOpen' },
  { name: 'aha-lock', component: IconAhaLock, displayName: 'Lock' },
  { name: 'aha-magic-wand', component: IconAhaMagicWand, displayName: 'MagicWand' },
  { name: 'aha-magnifying-glass', component: IconAhaMagnifyingGlass, displayName: 'MagnifyingGlass' },
  { name: 'aha-microphone', component: IconAhaMicrophone, displayName: 'Microphone' },
  { name: 'aha-microsoft-excel-logo', component: IconAhaMicrosoftExcelLogo, displayName: 'MicrosoftExcelLogo' },
  { name: 'aha-minus-square', component: IconAhaMinusSquare, displayName: 'MinusSquare' },
  { name: 'aha-minus', component: IconAhaMinus, displayName: 'Minus' },
  { name: 'aha-money-back', component: IconAhaMoneyBack, displayName: 'MoneyBack' },
  { name: 'aha-music-notes-simple', component: IconAhaMusicNotesSimple, displayName: 'MusicNotesSimple' },
  { name: 'aha-music-notes', component: IconAhaMusicNotes, displayName: 'MusicNotes' },
  { name: 'aha-note-filled', component: IconAhaNoteFilled, displayName: 'NoteFilled' },
  { name: 'aha-note', component: IconAhaNote, displayName: 'Note' },
  { name: 'aha-number-one', component: IconAhaNumberOne, displayName: 'NumberOne' },
  { name: 'aha-palette', component: IconAhaPalette, displayName: 'Palette' },
  { name: 'aha-paper-clip', component: IconAhaPaperClip, displayName: 'PaperClip' },
  { name: 'aha-paste', component: IconAhaPaste, displayName: 'Paste' },
  { name: 'aha-pause', component: IconAhaPause, displayName: 'Pause' },
  { name: 'aha-pencil-simple-line', component: IconAhaPencilSimpleLine, displayName: 'PencilSimpleLine' },
  { name: 'aha-pencil-simple', component: IconAhaPencilSimple, displayName: 'PencilSimple' },
  { name: 'aha-percent', component: IconAhaPercent, displayName: 'Percent' },
  { name: 'aha-pinned-filled', component: IconAhaPinnedFilled, displayName: 'PinnedFilled' },
  { name: 'aha-plan', component: IconAhaPlan, displayName: 'Plan' },
  { name: 'aha-play', component: IconAhaPlay, displayName: 'Play' },
  { name: 'aha-plus-square', component: IconAhaPlusSquare, displayName: 'PlusSquare' },
  { name: 'aha-plus', component: IconAhaPlus, displayName: 'Plus' },
  { name: 'aha-presentation-chart-one', component: IconAhaPresentationChartOne, displayName: 'PresentationChartOne' },
  { name: 'aha-presentation-chart', component: IconAhaPresentationChart, displayName: 'PresentationChart' },
  { name: 'aha-presentation-connect', component: IconAhaPresentationConnect, displayName: 'PresentationConnect' },
  { name: 'aha-presentation-disconnect', component: IconAhaPresentationDisconnect, displayName: 'PresentationDisconnect' },
  { name: 'aha-projector-screen-chart', component: IconAhaProjectorScreenChart, displayName: 'ProjectorScreenChart' },
  { name: 'aha-push-pin', component: IconAhaPushPin, displayName: 'PushPin' },
  { name: 'aha-q&a', component: IconAhaQA, displayName: 'Q&A' },
  { name: 'aha-qr-code', component: IconAhaQrCode, displayName: 'QrCode' },
  { name: 'aha-question', component: IconAhaQuestion, displayName: 'Question' },
  { name: 'aha-remote', component: IconAhaRemote, displayName: 'Remote' },
  { name: 'aha-rows', component: IconAhaRows, displayName: 'Rows' },
  { name: 'aha-scissors', component: IconAhaScissors, displayName: 'Scissors' },
  { name: 'aha-shapes', component: IconAhaShapes, displayName: 'Shapes' },
  { name: 'aha-share-network', component: IconAhaShareNetwork, displayName: 'ShareNetwork' },
  { name: 'aha-shield-check', component: IconAhaShieldCheck, displayName: 'ShieldCheck' },
  { name: 'aha-shield-warning', component: IconAhaShieldWarning, displayName: 'ShieldWarning' },
  { name: 'aha-shuffle', component: IconAhaShuffle, displayName: 'Shuffle' },
  { name: 'aha-sign-out', component: IconAhaSignOut, displayName: 'SignOut' },
  { name: 'aha-sliders-horizontal', component: IconAhaSlidersHorizontal, displayName: 'SlidersHorizontal' },
  { name: 'aha-smiley', component: IconAhaSmiley, displayName: 'Smiley' },
  { name: 'aha-sparkle', component: IconAhaSparkle, displayName: 'Sparkle' },
  { name: 'aha-speaker-simple-high', component: IconAhaSpeakerSimpleHigh, displayName: 'SpeakerSimpleHigh' },
  { name: 'aha-speaker-simple-x', component: IconAhaSpeakerSimpleX, displayName: 'SpeakerSimpleX' },
  { name: 'aha-square-split-horizontal', component: IconAhaSquareSplitHorizontal, displayName: 'SquareSplitHorizontal' },
  { name: 'aha-squares-four', component: IconAhaSquaresFour, displayName: 'SquaresFour' },
  { name: 'aha-stack-simple', component: IconAhaStackSimple, displayName: 'StackSimple' },
  { name: 'aha-stack', component: IconAhaStack, displayName: 'Stack' },
  { name: 'aha-star', component: IconAhaStar, displayName: 'Star' },
  { name: 'aha-stop', component: IconAhaStop, displayName: 'Stop' },
  { name: 'aha-table', component: IconAhaTable, displayName: 'Table' },
  { name: 'aha-text-t', component: IconAhaTextT, displayName: 'TextT' },
  { name: 'aha-thumbs-down', component: IconAhaThumbsDown, displayName: 'ThumbsDown' },
  { name: 'aha-thumbs-up', component: IconAhaThumbsUp, displayName: 'ThumbsUp' },
  { name: 'aha-timer', component: IconAhaTimer, displayName: 'Timer' },
  { name: 'aha-trash', component: IconAhaTrash, displayName: 'Trash' },
  { name: 'aha-trend-down', component: IconAhaTrendDown, displayName: 'TrendDown' },
  { name: 'aha-trend-up', component: IconAhaTrendUp, displayName: 'TrendUp' },
  { name: 'aha-trophy-slash', component: IconAhaTrophySlash, displayName: 'TrophySlash' },
  { name: 'aha-trophy', component: IconAhaTrophy, displayName: 'Trophy' },
  { name: 'aha-upload-simple', component: IconAhaUploadSimple, displayName: 'UploadSimple' },
  { name: 'aha-user-circle', component: IconAhaUserCircle, displayName: 'UserCircle' },
  { name: 'aha-user-plus', component: IconAhaUserPlus, displayName: 'UserPlus' },
  { name: 'aha-user', component: IconAhaUser, displayName: 'User' },
  { name: 'aha-users-three', component: IconAhaUsersThree, displayName: 'UsersThree' },
  { name: 'aha-users', component: IconAhaUsers, displayName: 'Users' },
  { name: 'aha-video', component: IconAhaVideo, displayName: 'Video' },
  { name: 'aha-wallet', component: IconAhaWallet, displayName: 'Wallet' },
  { name: 'aha-warning-circle', component: IconAhaWarningCircle, displayName: 'WarningCircle' },
  { name: 'aha-whatsapp-logo', component: IconAhaWhatsappLogo, displayName: 'WhatsappLogo' },
  { name: 'aha-x-circle', component: IconAhaXCircle, displayName: 'XCircle' },
  { name: 'aha-x', component: IconAhaX, displayName: 'X' },
]);

// Filter icons based on search
const filteredIcons = computed(() => {
  if (!searchQuery.value) return icons.value;
  const query = searchQuery.value.toLowerCase();
  return icons.value.filter(icon => 
    icon.name.toLowerCase().includes(query) || 
    icon.displayName.toLowerCase().includes(query)
  );
});

// Copy icon import to clipboard
const copyIconImport = (iconName: string) => {
  const importStatement = `import Icon${iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')} from '~icons/aha/${iconName}'`;
  navigator.clipboard.writeText(importStatement);
  message.success('Import statement copied to clipboard!');
};
</script>

<style scoped>
.icon-card {
  width: 100px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-card:hover {
  border-color: var(--aha-colorPrimaryText);
  background: #faf5ff;
  transform: translateY(-4px) scale(1.05);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f9fafb;
}

.icon {
  width: 32px;
  height: 32px;
  color: #4b5563;
}

.icon-card:hover .icon {
  color: #9333ea;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  color: #6b7280;
}
</style>
