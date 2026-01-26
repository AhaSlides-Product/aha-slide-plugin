<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">  
  <div class="p-8 bg-base-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">Custom Aha Icons</h1>
      <p class="text-base-70">All custom SVG icons loaded via unplugin-icons from @aha/ui package</p>
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

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
      <a-card size="small" class="stat-card">
        <a-statistic title="Total Icons" :value="icons.length">
          <template #prefix>
            <AppstoreOutlined class="text-purple-60" />
          </template>
        </a-statistic>
      </a-card>
      <a-card size="small" class="stat-card">
        <a-statistic title="Showing" :value="filteredIcons.length">
          <template #prefix>
            <FilterOutlined class="text-emerald-60" />
          </template>
        </a-statistic>
      </a-card>
      <a-card size="small" class="stat-card">
        <a-statistic title="Click to Copy" value="Import">
          <template #prefix>
            <CopyOutlined class="text-coral-60" />
          </template>
        </a-statistic>
      </a-card>
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
              <component :is="icon.component" class="icon" />
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
  AppstoreOutlined, 
  FilterOutlined, 
  CopyOutlined,
} from '@ant-design/icons-vue';
import { ahaSlidesDefaultTheme } from '@aha/ui';

// Import all icons dynamically
import IconSystemAlignCenter from '~icons/aha/system-align-center';
import IconSystemAlignLeft from '~icons/aha/system-align-left';
import IconSystemAlignRight from '~icons/aha/system-align-right';
import IconSystemAnimation from '~icons/aha/system-animation';
import IconSystemArrowClockwise from '~icons/aha/system-arrow-clockwise';
import IconSystemArrowCounterClockwise from '~icons/aha/system-arrow-counter-clockwise';
import IconSystemArrowDown from '~icons/aha/system-arrow-down';
import IconSystemArrowLeft from '~icons/aha/system-arrow-left';
import IconSystemArrowRight from '~icons/aha/system-arrow-right';
import IconSystemArrowSquareOut from '~icons/aha/system-arrow-square-out';
import IconSystemArrowUUpLeft from '~icons/aha/system-arrow-u-up-left';
import IconSystemArrowUUpRight from '~icons/aha/system-arrow-u-up-right';
import IconSystemArrowUp from '~icons/aha/system-arrow-up';
import IconSystemArrowsClockwise from '~icons/aha/system-arrows-clockwise';
import IconSystemArrowsDownUp from '~icons/aha/system-arrows-down-up';
import IconSystemArrowsInSimple from '~icons/aha/system-arrows-in-simple';
import IconSystemArrowsLeftRight from '~icons/aha/system-arrows-left-right';
import IconSystemArrowsOutCardinal from '~icons/aha/system-arrows-out-cardinal';
import IconSystemArrowsOutSimple from '~icons/aha/system-arrows-out-simple';
import IconSystemAsterisk from '~icons/aha/system-asterisk';
import IconSystemBackstage from '~icons/aha/system-backstage';
import IconSystemBell from '~icons/aha/system-bell';
import IconSystemBook from '~icons/aha/system-book';
import IconSystemBookmarkSimple from '~icons/aha/system-bookmark-simple';
import IconSystemBriefcase from '~icons/aha/system-briefcase';
import IconSystemCalendarDot from '~icons/aha/system-calendar-dot';
import IconSystemCalendarDots from '~icons/aha/system-calendar-dots';
import IconSystemCardsThree from '~icons/aha/system-cards-three';
import IconSystemCaretDown from '~icons/aha/system-caret-down';
import IconSystemCaretLeft from '~icons/aha/system-caret-left';
import IconSystemCaretRight from '~icons/aha/system-caret-right';
import IconSystemCaretUp from '~icons/aha/system-caret-up';
import IconSystemChartBar from '~icons/aha/system-chart-bar';
import IconSystemChartDonut from '~icons/aha/system-chart-donut';
import IconSystemChartLineUp from '~icons/aha/system-chart-line-up';
import IconSystemChartPie from '~icons/aha/system-chart-pie';
import IconSystemChatAdd from '~icons/aha/system-chat-add';
import IconSystemChatCenteredText from '~icons/aha/system-chat-centered-text';
import IconSystemChatCircle from '~icons/aha/system-chat-circle';
import IconSystemChatText from '~icons/aha/system-chat-text';
import IconSystemChatsCircle from '~icons/aha/system-chats-circle';
import IconSystemCheckCircle from '~icons/aha/system-check-circle';
import IconSystemCheck from '~icons/aha/system-check';
import IconSystemCircleNotch from '~icons/aha/system-circle-notch';
import IconSystemConfetti from '~icons/aha/system-confetti';
import IconSystemCopy from '~icons/aha/system-copy';
import IconSystemCreditCard from '~icons/aha/system-credit-card';
import IconSystemCurrencyCircleDollar from '~icons/aha/system-currency-circle-dollar';
import IconSystemCursorClick from '~icons/aha/system-cursor-click';
import IconSystemDeviceMobile from '~icons/aha/system-device-mobile';
import IconSystemDocumentCheck from '~icons/aha/system-document-check';
import IconSystemDotsThreeVertical from '~icons/aha/system-dots-three-vertical';
import IconSystemDotsThree from '~icons/aha/system-dots-three';
import IconSystemDownloadSimple from '~icons/aha/system-download-simple';
import IconSystemDrag from '~icons/aha/system-drag';
import IconSystemDrum from '~icons/aha/system-drum';
import IconSystemDuplicate from '~icons/aha/system-duplicate';
import IconSystemEmojiBubble from '~icons/aha/system-emoji-bubble';
import IconSystemEnvelop from '~icons/aha/system-envelop';
import IconSystemEnvelope from '~icons/aha/system-envelope';
import IconSystemEquation from '~icons/aha/system-equation';
import IconSystemExclamationMark from '~icons/aha/system-exclamation-mark';
import IconSystemExport from '~icons/aha/system-export';
import IconSystemEyeSlash from '~icons/aha/system-eye-slash';
import IconSystemEye from '~icons/aha/system-eye';
import IconSystemFileArrowDown from '~icons/aha/system-file-arrow-down';
import IconSystemFileArrowIn from '~icons/aha/system-file-arrow-in';
import IconSystemFileArrowUp from '~icons/aha/system-file-arrow-up';
import IconSystemFileAudio from '~icons/aha/system-file-audio';
import IconSystemFileCheck from '~icons/aha/system-file-check';
import IconSystemFileXls from '~icons/aha/system-file-xls';
import IconSystemFile from '~icons/aha/system-file';
import IconSystemFolder2 from '~icons/aha/system-folder-2';
import IconSystemFolderSimpleArrow from '~icons/aha/system-folder-simple-arrow';
import IconSystemFolderSimplePlus from '~icons/aha/system-folder-simple-plus';
import IconSystemFolderUser from '~icons/aha/system-folder-user';
import IconSystemFolder from '~icons/aha/system-folder';
import IconSystemForm from '~icons/aha/system-form';
import IconSystemFrameCorners from '~icons/aha/system-frame-corners';
import IconSystemGear from '~icons/aha/system-gear';
import IconSystemGif from '~icons/aha/system-gif';
import IconSystemGlobeSimple from '~icons/aha/system-globe-simple';
import IconSystemHandPointing from '~icons/aha/system-hand-pointing';
import IconSystemHand from '~icons/aha/system-hand';
import IconSystemHandsClapping from '~icons/aha/system-hands-clapping';
import IconSystemHeartStraight from '~icons/aha/system-heart-straight';
import IconSystemHourglassHigh from '~icons/aha/system-hourglass-high';
// Additional icons used in examples
import IconSystemStar from '~icons/aha/system-star';
import IconSystemFire from '~icons/aha/system-fire';
import IconSystemGift from '~icons/aha/system-gift';
import IconSystemSparkle from '~icons/aha/system-sparkle';
import IconSystemHouse from '~icons/aha/system-house';
import IconSystemIdentificationCard from '~icons/aha/system-identification-card';
import IconSystemImageSquare from '~icons/aha/system-image-square';
import IconSystemImages from '~icons/aha/system-images';
import IconSystemInfo from '~icons/aha/system-info';
import IconSystemInvoice from '~icons/aha/system-invoice';
import IconSystemKSquare from '~icons/aha/system-k-square';
import IconSystemKeyReturn from '~icons/aha/system-key-return';
import IconSystemLayout from '~icons/aha/system-layout';
import IconSystemLightbulbFilament from '~icons/aha/system-lightbulb-filament';
import IconSystemLineWeight from '~icons/aha/system-line-weight';
import IconSystemLink from '~icons/aha/system-link';
import IconSystemList1 from '~icons/aha/system-list-1';
import IconSystemListNumbers from '~icons/aha/system-list-numbers';
import IconSystemList from '~icons/aha/system-list';
import IconSystemLockOpen from '~icons/aha/system-lock-open';
import IconSystemLock from '~icons/aha/system-lock';
import IconSystemMagicWand from '~icons/aha/system-magic-wand';
import IconSystemMagnifyingGlass from '~icons/aha/system-magnifying-glass';
import IconSystemMicrophone from '~icons/aha/system-microphone';
import IconSystemMicrosoftExcelLogo from '~icons/aha/system-microsoft-excel-logo';
import IconSystemMinusSquare from '~icons/aha/system-minus-square';
import IconSystemMinus from '~icons/aha/system-minus';
import IconSystemMoneyBack from '~icons/aha/system-money-back';
import IconSystemMusicNotesSimple from '~icons/aha/system-music-notes-simple';
import IconSystemMusicNotes from '~icons/aha/system-music-notes';
import IconSystemNoteFilled from '~icons/aha/system-note-filled';
import IconSystemNote from '~icons/aha/system-note';
import IconSystemNumberOne from '~icons/aha/system-number-one';
import IconSystemPalette from '~icons/aha/system-palette';
import IconSystemPaperClip from '~icons/aha/system-paper-clip';
import IconSystemPaste from '~icons/aha/system-paste';
import IconSystemPause from '~icons/aha/system-pause';
import IconSystemPencilSimpleLine from '~icons/aha/system-pencil-simple-line';
import IconSystemPencilSimple from '~icons/aha/system-pencil-simple';
import IconSystemPercent from '~icons/aha/system-percent';
import IconSystemPinnedFilled from '~icons/aha/system-pinned-filled';
import IconSystemPlan from '~icons/aha/system-plan';
import IconSystemPlay from '~icons/aha/system-play';
import IconSystemPlusSquare from '~icons/aha/system-plus-square';
import IconSystemPlus from '~icons/aha/system-plus';
import IconSystemPresentationChartOne from '~icons/aha/system-presentation-chart-one';
import IconSystemPresentationChart from '~icons/aha/system-presentation-chart';
import IconSystemPresentationConnect from '~icons/aha/system-presentation-connect';
import IconSystemPresentationDisconnect from '~icons/aha/system-presentation-disconnect';
import IconSystemProjectorScreenChart from '~icons/aha/system-projector-screen-chart';
import IconSystemPushPin from '~icons/aha/system-push-pin';
import IconSystemQA from '~icons/aha/system-q&a';
import IconSystemQrCode from '~icons/aha/system-qr-code';
import IconSystemQuestion from '~icons/aha/system-question';
import IconSystemRemote from '~icons/aha/system-remote';
import IconSystemRows from '~icons/aha/system-rows';
import IconSystemScissors from '~icons/aha/system-scissors';
import IconSystemShapes from '~icons/aha/system-shapes';
import IconSystemShareNetwork from '~icons/aha/system-share-network';
import IconSystemShieldCheck from '~icons/aha/system-shield-check';
import IconSystemShieldWarning from '~icons/aha/system-shield-warning';
import IconSystemShuffle from '~icons/aha/system-shuffle';
import IconSystemSignOut from '~icons/aha/system-sign-out';
import IconSystemSlidersHorizontal from '~icons/aha/system-sliders-horizontal';
import IconSystemSmiley from '~icons/aha/system-smiley';
import IconSystemSpeakerSimpleHigh from '~icons/aha/system-speaker-simple-high';
import IconSystemSpeakerSimpleX from '~icons/aha/system-speaker-simple-x';
import IconSystemSquaresFour from '~icons/aha/system-squares-four';
import IconSystemStackSimple from '~icons/aha/system-stack-simple';
import IconSystemStack from '~icons/aha/system-stack';
import IconSystemStop from '~icons/aha/system-stop';
import IconSystemTable from '~icons/aha/system-table';
import IconSystemTextT from '~icons/aha/system-text-t';
import IconSystemThumbsDown from '~icons/aha/system-thumbs-down';
import IconSystemThumbsUp from '~icons/aha/system-thumbs-up';
import IconSystemTimer from '~icons/aha/system-timer';
import IconSystemTrash from '~icons/aha/system-trash';
import IconSystemTrendDown from '~icons/aha/system-trend-down';
import IconSystemTrendUp from '~icons/aha/system-trend-up';
import IconSystemTrophySlash from '~icons/aha/system-trophy-slash';
import IconSystemTrophy from '~icons/aha/system-trophy';
import IconSystemUploadSimple from '~icons/aha/system-upload-simple';
import IconSystemUserCircle from '~icons/aha/system-user-circle';
import IconSystemUserPlus from '~icons/aha/system-user-plus';
import IconSystemUser from '~icons/aha/system-user';
import IconSystemUsersThree from '~icons/aha/system-users-three';
import IconSystemUsers from '~icons/aha/system-users';
import IconSystemVideo from '~icons/aha/system-video';
import IconSystemWallet from '~icons/aha/system-wallet';
import IconSystemWarningCircle from '~icons/aha/system-warning-circle';
import IconSystemWhatsappLogo from '~icons/aha/system-whatsapp-logo';
import IconSystemXCircle from '~icons/aha/system-x-circle';
import IconSystemX from '~icons/aha/system-x';

// Search state
const searchQuery = ref('');

// Icons list
const icons = ref([
  { name: 'system-align-center', component: IconSystemAlignCenter, displayName: 'AlignCenter' },
  { name: 'system-align-left', component: IconSystemAlignLeft, displayName: 'AlignLeft' },
  { name: 'system-align-right', component: IconSystemAlignRight, displayName: 'AlignRight' },
  { name: 'system-animation', component: IconSystemAnimation, displayName: 'Animation' },
  { name: 'system-arrow-clockwise', component: IconSystemArrowClockwise, displayName: 'ArrowClockwise' },
  { name: 'system-arrow-counter-clockwise', component: IconSystemArrowCounterClockwise, displayName: 'ArrowCounterClockwise' },
  { name: 'system-arrow-down', component: IconSystemArrowDown, displayName: 'ArrowDown' },
  { name: 'system-arrow-left', component: IconSystemArrowLeft, displayName: 'ArrowLeft' },
  { name: 'system-arrow-right', component: IconSystemArrowRight, displayName: 'ArrowRight' },
  { name: 'system-arrow-square-out', component: IconSystemArrowSquareOut, displayName: 'ArrowSquareOut' },
  { name: 'system-arrow-u-up-left', component: IconSystemArrowUUpLeft, displayName: 'ArrowUUpLeft' },
  { name: 'system-arrow-u-up-right', component: IconSystemArrowUUpRight, displayName: 'ArrowUUpRight' },
  { name: 'system-arrow-up', component: IconSystemArrowUp, displayName: 'ArrowUp' },
  { name: 'system-arrows-clockwise', component: IconSystemArrowsClockwise, displayName: 'ArrowsClockwise' },
  { name: 'system-arrows-down-up', component: IconSystemArrowsDownUp, displayName: 'ArrowsDownUp' },
  { name: 'system-arrows-in-simple', component: IconSystemArrowsInSimple, displayName: 'ArrowsInSimple' },
  { name: 'system-arrows-left-right', component: IconSystemArrowsLeftRight, displayName: 'ArrowsLeftRight' },
  { name: 'system-arrows-out-cardinal', component: IconSystemArrowsOutCardinal, displayName: 'ArrowsOutCardinal' },
  { name: 'system-arrows-out-simple', component: IconSystemArrowsOutSimple, displayName: 'ArrowsOutSimple' },
  { name: 'system-asterisk', component: IconSystemAsterisk, displayName: 'Asterisk' },
  { name: 'system-backstage', component: IconSystemBackstage, displayName: 'Backstage' },
  { name: 'system-bell', component: IconSystemBell, displayName: 'Bell' },
  { name: 'system-book', component: IconSystemBook, displayName: 'Book' },
  { name: 'system-bookmark-simple', component: IconSystemBookmarkSimple, displayName: 'BookmarkSimple' },
  { name: 'system-briefcase', component: IconSystemBriefcase, displayName: 'Briefcase' },
  { name: 'system-calendar-dot', component: IconSystemCalendarDot, displayName: 'CalendarDot' },
  { name: 'system-calendar-dots', component: IconSystemCalendarDots, displayName: 'CalendarDots' },
  { name: 'system-cards-three', component: IconSystemCardsThree, displayName: 'CardsThree' },
  { name: 'system-caret-down', component: IconSystemCaretDown, displayName: 'CaretDown' },
  { name: 'system-caret-left', component: IconSystemCaretLeft, displayName: 'CaretLeft' },
  { name: 'system-caret-right', component: IconSystemCaretRight, displayName: 'CaretRight' },
  { name: 'system-caret-up', component: IconSystemCaretUp, displayName: 'CaretUp' },
  { name: 'system-chart-bar', component: IconSystemChartBar, displayName: 'ChartBar' },
  { name: 'system-chart-donut', component: IconSystemChartDonut, displayName: 'ChartDonut' },
  { name: 'system-chart-line-up', component: IconSystemChartLineUp, displayName: 'ChartLineUp' },
  { name: 'system-chart-pie', component: IconSystemChartPie, displayName: 'ChartPie' },
  { name: 'system-chat-add', component: IconSystemChatAdd, displayName: 'ChatAdd' },
  { name: 'system-chat-centered-text', component: IconSystemChatCenteredText, displayName: 'ChatCenteredText' },
  { name: 'system-chat-circle', component: IconSystemChatCircle, displayName: 'ChatCircle' },
  { name: 'system-chat-text', component: IconSystemChatText, displayName: 'ChatText' },
  { name: 'system-chats-circle', component: IconSystemChatsCircle, displayName: 'ChatsCircle' },
  { name: 'system-check-circle', component: IconSystemCheckCircle, displayName: 'CheckCircle' },
  { name: 'system-check', component: IconSystemCheck, displayName: 'Check' },
  { name: 'system-circle-notch', component: IconSystemCircleNotch, displayName: 'CircleNotch' },
  { name: 'system-confetti', component: IconSystemConfetti, displayName: 'Confetti' },
  { name: 'system-copy', component: IconSystemCopy, displayName: 'Copy' },
  { name: 'system-credit-card', component: IconSystemCreditCard, displayName: 'CreditCard' },
  { name: 'system-currency-circle-dollar', component: IconSystemCurrencyCircleDollar, displayName: 'CurrencyCircleDollar' },
  { name: 'system-cursor-click', component: IconSystemCursorClick, displayName: 'CursorClick' },
  { name: 'system-device-mobile', component: IconSystemDeviceMobile, displayName: 'DeviceMobile' },
  { name: 'system-document-check', component: IconSystemDocumentCheck, displayName: 'DocumentCheck' },
  { name: 'system-dots-three-vertical', component: IconSystemDotsThreeVertical, displayName: 'DotsThreeVertical' },
  { name: 'system-dots-three', component: IconSystemDotsThree, displayName: 'DotsThree' },
  { name: 'system-download-simple', component: IconSystemDownloadSimple, displayName: 'DownloadSimple' },
  { name: 'system-drag', component: IconSystemDrag, displayName: 'Drag' },
  { name: 'system-drum', component: IconSystemDrum, displayName: 'Drum' },
  { name: 'system-duplicate', component: IconSystemDuplicate, displayName: 'Duplicate' },
  { name: 'system-emoji-bubble', component: IconSystemEmojiBubble, displayName: 'EmojiBubble' },
  { name: 'system-envelop', component: IconSystemEnvelop, displayName: 'Envelop' },
  { name: 'system-envelope', component: IconSystemEnvelope, displayName: 'Envelope' },
  { name: 'system-equation', component: IconSystemEquation, displayName: 'Equation' },
  { name: 'system-exclamation-mark', component: IconSystemExclamationMark, displayName: 'ExclamationMark' },
  { name: 'system-export', component: IconSystemExport, displayName: 'Export' },
  { name: 'system-eye-slash', component: IconSystemEyeSlash, displayName: 'EyeSlash' },
  { name: 'system-eye', component: IconSystemEye, displayName: 'Eye' },
  { name: 'system-file-arrow-down', component: IconSystemFileArrowDown, displayName: 'FileArrowDown' },
  { name: 'system-file-arrow-in', component: IconSystemFileArrowIn, displayName: 'FileArrowIn' },
  { name: 'system-file-arrow-up', component: IconSystemFileArrowUp, displayName: 'FileArrowUp' },
  { name: 'system-file-audio', component: IconSystemFileAudio, displayName: 'FileAudio' },
  { name: 'system-file-check', component: IconSystemFileCheck, displayName: 'FileCheck' },
  { name: 'system-file-xls', component: IconSystemFileXls, displayName: 'FileXls' },
  { name: 'system-file', component: IconSystemFile, displayName: 'File' },
  { name: 'system-fire', component: IconSystemFire, displayName: 'Fire' },
  { name: 'system-folder-2', component: IconSystemFolder2, displayName: 'Folder2' },
  { name: 'system-folder-simple-arrow', component: IconSystemFolderSimpleArrow, displayName: 'FolderSimpleArrow' },
  { name: 'system-folder-simple-plus', component: IconSystemFolderSimplePlus, displayName: 'FolderSimplePlus' },
  { name: 'system-folder-user', component: IconSystemFolderUser, displayName: 'FolderUser' },
  { name: 'system-folder', component: IconSystemFolder, displayName: 'Folder' },
  { name: 'system-form', component: IconSystemForm, displayName: 'Form' },
  { name: 'system-frame-corners', component: IconSystemFrameCorners, displayName: 'FrameCorners' },
  { name: 'system-gear', component: IconSystemGear, displayName: 'Gear' },
  { name: 'system-gif', component: IconSystemGif, displayName: 'Gif' },
  { name: 'system-gift', component: IconSystemGift, displayName: 'Gift' },
  { name: 'system-globe-simple', component: IconSystemGlobeSimple, displayName: 'GlobeSimple' },
  { name: 'system-hand-pointing', component: IconSystemHandPointing, displayName: 'HandPointing' },
  { name: 'system-hand', component: IconSystemHand, displayName: 'Hand' },
  { name: 'system-hands-clapping', component: IconSystemHandsClapping, displayName: 'HandsClapping' },
  { name: 'system-heart-straight', component: IconSystemHeartStraight, displayName: 'HeartStraight' },
  { name: 'system-hourglass-high', component: IconSystemHourglassHigh, displayName: 'HourglassHigh' },
  { name: 'system-house', component: IconSystemHouse, displayName: 'House' },
  { name: 'system-identification-card', component: IconSystemIdentificationCard, displayName: 'IdentificationCard' },
  { name: 'system-image-square', component: IconSystemImageSquare, displayName: 'ImageSquare' },
  { name: 'system-images', component: IconSystemImages, displayName: 'Images' },
  { name: 'system-info', component: IconSystemInfo, displayName: 'Info' },
  { name: 'system-invoice', component: IconSystemInvoice, displayName: 'Invoice' },
  { name: 'system-k-square', component: IconSystemKSquare, displayName: 'KSquare' },
  { name: 'system-key-return', component: IconSystemKeyReturn, displayName: 'KeyReturn' },
  { name: 'system-layout', component: IconSystemLayout, displayName: 'Layout' },
  { name: 'system-lightbulb-filament', component: IconSystemLightbulbFilament, displayName: 'LightbulbFilament' },
  { name: 'system-line-weight', component: IconSystemLineWeight, displayName: 'LineWeight' },
  { name: 'system-link', component: IconSystemLink, displayName: 'Link' },
  { name: 'system-list-1', component: IconSystemList1, displayName: 'List1' },
  { name: 'system-list-numbers', component: IconSystemListNumbers, displayName: 'ListNumbers' },
  { name: 'system-list', component: IconSystemList, displayName: 'List' },
  { name: 'system-lock-open', component: IconSystemLockOpen, displayName: 'LockOpen' },
  { name: 'system-lock', component: IconSystemLock, displayName: 'Lock' },
  { name: 'system-magic-wand', component: IconSystemMagicWand, displayName: 'MagicWand' },
  { name: 'system-magnifying-glass', component: IconSystemMagnifyingGlass, displayName: 'MagnifyingGlass' },
  { name: 'system-microphone', component: IconSystemMicrophone, displayName: 'Microphone' },
  { name: 'system-microsoft-excel-logo', component: IconSystemMicrosoftExcelLogo, displayName: 'MicrosoftExcelLogo' },
  { name: 'system-minus-square', component: IconSystemMinusSquare, displayName: 'MinusSquare' },
  { name: 'system-minus', component: IconSystemMinus, displayName: 'Minus' },
  { name: 'system-money-back', component: IconSystemMoneyBack, displayName: 'MoneyBack' },
  { name: 'system-music-notes-simple', component: IconSystemMusicNotesSimple, displayName: 'MusicNotesSimple' },
  { name: 'system-music-notes', component: IconSystemMusicNotes, displayName: 'MusicNotes' },
  { name: 'system-note-filled', component: IconSystemNoteFilled, displayName: 'NoteFilled' },
  { name: 'system-note', component: IconSystemNote, displayName: 'Note' },
  { name: 'system-number-one', component: IconSystemNumberOne, displayName: 'NumberOne' },
  { name: 'system-palette', component: IconSystemPalette, displayName: 'Palette' },
  { name: 'system-paper-clip', component: IconSystemPaperClip, displayName: 'PaperClip' },
  { name: 'system-paste', component: IconSystemPaste, displayName: 'Paste' },
  { name: 'system-pause', component: IconSystemPause, displayName: 'Pause' },
  { name: 'system-pencil-simple-line', component: IconSystemPencilSimpleLine, displayName: 'PencilSimpleLine' },
  { name: 'system-pencil-simple', component: IconSystemPencilSimple, displayName: 'PencilSimple' },
  { name: 'system-percent', component: IconSystemPercent, displayName: 'Percent' },
  { name: 'system-pinned-filled', component: IconSystemPinnedFilled, displayName: 'PinnedFilled' },
  { name: 'system-plan', component: IconSystemPlan, displayName: 'Plan' },
  { name: 'system-play', component: IconSystemPlay, displayName: 'Play' },
  { name: 'system-plus-square', component: IconSystemPlusSquare, displayName: 'PlusSquare' },
  { name: 'system-plus', component: IconSystemPlus, displayName: 'Plus' },
  { name: 'system-presentation-chart-one', component: IconSystemPresentationChartOne, displayName: 'PresentationChartOne' },
  { name: 'system-presentation-chart', component: IconSystemPresentationChart, displayName: 'PresentationChart' },
  { name: 'system-presentation-connect', component: IconSystemPresentationConnect, displayName: 'PresentationConnect' },
  { name: 'system-presentation-disconnect', component: IconSystemPresentationDisconnect, displayName: 'PresentationDisconnect' },
  { name: 'system-projector-screen-chart', component: IconSystemProjectorScreenChart, displayName: 'ProjectorScreenChart' },
  { name: 'system-push-pin', component: IconSystemPushPin, displayName: 'PushPin' },
  { name: 'system-q&a', component: IconSystemQA, displayName: 'Q&A' },
  { name: 'system-qr-code', component: IconSystemQrCode, displayName: 'QrCode' },
  { name: 'system-question', component: IconSystemQuestion, displayName: 'Question' },
  { name: 'system-remote', component: IconSystemRemote, displayName: 'Remote' },
  { name: 'system-rows', component: IconSystemRows, displayName: 'Rows' },
  { name: 'system-scissors', component: IconSystemScissors, displayName: 'Scissors' },
  { name: 'system-shapes', component: IconSystemShapes, displayName: 'Shapes' },
  { name: 'system-share-network', component: IconSystemShareNetwork, displayName: 'ShareNetwork' },
  { name: 'system-shield-check', component: IconSystemShieldCheck, displayName: 'ShieldCheck' },
  { name: 'system-shield-warning', component: IconSystemShieldWarning, displayName: 'ShieldWarning' },
  { name: 'system-shuffle', component: IconSystemShuffle, displayName: 'Shuffle' },
  { name: 'system-sign-out', component: IconSystemSignOut, displayName: 'SignOut' },
  { name: 'system-sliders-horizontal', component: IconSystemSlidersHorizontal, displayName: 'SlidersHorizontal' },
  { name: 'system-smiley', component: IconSystemSmiley, displayName: 'Smiley' },
  { name: 'system-sparkle', component: IconSystemSparkle, displayName: 'Sparkle' },
  { name: 'system-speaker-simple-high', component: IconSystemSpeakerSimpleHigh, displayName: 'SpeakerSimpleHigh' },
  { name: 'system-speaker-simple-x', component: IconSystemSpeakerSimpleX, displayName: 'SpeakerSimpleX' },
  { name: 'system-squares-four', component: IconSystemSquaresFour, displayName: 'SquaresFour' },
  { name: 'system-stack-simple', component: IconSystemStackSimple, displayName: 'StackSimple' },
  { name: 'system-stack', component: IconSystemStack, displayName: 'Stack' },
  { name: 'system-star', component: IconSystemStar, displayName: 'Star' },
  { name: 'system-stop', component: IconSystemStop, displayName: 'Stop' },
  { name: 'system-table', component: IconSystemTable, displayName: 'Table' },
  { name: 'system-text-t', component: IconSystemTextT, displayName: 'TextT' },
  { name: 'system-thumbs-down', component: IconSystemThumbsDown, displayName: 'ThumbsDown' },
  { name: 'system-thumbs-up', component: IconSystemThumbsUp, displayName: 'ThumbsUp' },
  { name: 'system-timer', component: IconSystemTimer, displayName: 'Timer' },
  { name: 'system-trash', component: IconSystemTrash, displayName: 'Trash' },
  { name: 'system-trend-down', component: IconSystemTrendDown, displayName: 'TrendDown' },
  { name: 'system-trend-up', component: IconSystemTrendUp, displayName: 'TrendUp' },
  { name: 'system-trophy-slash', component: IconSystemTrophySlash, displayName: 'TrophySlash' },
  { name: 'system-trophy', component: IconSystemTrophy, displayName: 'Trophy' },
  { name: 'system-upload-simple', component: IconSystemUploadSimple, displayName: 'UploadSimple' },
  { name: 'system-user-circle', component: IconSystemUserCircle, displayName: 'UserCircle' },
  { name: 'system-user-plus', component: IconSystemUserPlus, displayName: 'UserPlus' },
  { name: 'system-user', component: IconSystemUser, displayName: 'User' },
  { name: 'system-users-three', component: IconSystemUsersThree, displayName: 'UsersThree' },
  { name: 'system-users', component: IconSystemUsers, displayName: 'Users' },
  { name: 'system-video', component: IconSystemVideo, displayName: 'Video' },
  { name: 'system-wallet', component: IconSystemWallet, displayName: 'Wallet' },
  { name: 'system-warning-circle', component: IconSystemWarningCircle, displayName: 'WarningCircle' },
  { name: 'system-whatsapp-logo', component: IconSystemWhatsappLogo, displayName: 'WhatsappLogo' },
  { name: 'system-x-circle', component: IconSystemXCircle, displayName: 'XCircle' },
  { name: 'system-x', component: IconSystemX, displayName: 'X' },
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
  border-color: #9333ea;
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
