/** @type {import('tailwindcss').Config} */

/**
 * ============================================================
 * TAILWIND CONFIG - ANT DESIGN VUE THEME INTEGRATION
 * ============================================================
 * 
 * This Tailwind configuration serves as the single source of truth
 * for design tokens across the application. Values are imported into
 * packages/ui/src/theme.ts for Ant Design Vue theming.
 * 
 * When updating this file, consider updating the Ant Design Vue theme
 * mappings in theme.ts to maintain design consistency.
 * ============================================================
 */

// ============================================================
// SPACING SCALE
// Used by: padding, margin, gap, width, height
// Ant Design Vue tokens: padding*, margin*, controlHeight*
// Status: PARTIALLY MAPPED (only used via theme.spacing reference)
// TODO: Map to Ant Design Vue padding/margin/height tokens
// ============================================================
const spacing = {
  px: '1px',
  0: '0px',
  0.25: '0.0625rem',
  0.5: '0.125rem',
  0.75: '0.1875rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  15: '3.75rem',
  16: '4rem',
  18: '4.5rem',
  20: '5rem',
  22: '5.5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  76: '19rem',
  80: '20rem',
  96: '24rem',
  100: '25rem',
  104: '26rem',
  108: '27rem',
  134: '536px',
  140: '35rem',
}

module.exports = {
  purge: {
    content: [
      './public/**/*.html',
      './src/**/*.vue',
      './node_modules/@mindthegapstudio/stpancras-storybook-app/src/**/*.vue',
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      '3xs': '320px',
      '2xs': '375px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2lg': '1366px',
      xxl: '1440px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },
    // ============================================================
    // COLORS
    // Used throughout the design system for all color needs
    // Ant Design Vue tokens: color*, colorBg*, colorBorder*, colorText*, colorFill*
    // Status: PARTIALLY MAPPED (see theme.ts for current mappings)
    // TODO: Map additional semantic color variants (Bg, Border variations)
    // ============================================================
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      // TODO: Consider mapping to Ant Design Vue colorLink or custom brand tokens
      brand: {
        a100: '#4F9BF3',
        b100: '#FFB12E',
      },
      // MAPPED: primary[80] → colorInfo
      // TODO: Consider mapping other primary shades to Ant Design Vue tokens
      primary: {
        110: '#621BAF', // purple-70 | active
        100: '#621BAF', // purple-70
        90: '#6A1EBB', // purple-60 | default
        80: '#D3B4FF', // purple-30 | focus | MAPPED to colorInfo
        75: '#D3E6FD',
        70: '#D8E9FD',
        60: '#ECF4FE',
        50: '#F4F8FF', // not purple
        40: '#F2F7FF',
        20: '#F0E4FF', // purple-15
      },
      // TODO: Map to Ant Design Vue secondary/neutral tokens
      secondary: {
        100: '#282E3E',
        60: '#3F4557',
        50: '#525F7F',
        40: '#B4BCCF',
        20: '#D3D7E1',
        15: '#EFF1F7',
        10: '#F7FAFC',
      },
      // MAPPED: Extensively used for text, backgrounds, and borders
      // base[100] → colorText
      // base[80] → colorTextSecondary
      // base[70] → colorTextTertiary
      // base[60] → colorTextQuaternary
      // base[40] → colorBorder
      // base[30] → colorBorderSecondary
      // base[10] → colorBgLayout
      // base[0] → colorBgContainer, colorBgElevated
      // TODO: Map base[50] → colorTextDisabled, base[60] → colorTextPlaceholder
      base: {
        100: '#0A0A0A',  // MAPPED to colorText
        90: '#4B4B4B',
        80: '#707070',   // MAPPED to colorTextSecondary
        70: '#999999',   // MAPPED to colorTextTertiary
        65: '#9D9D9D',
        60: '#AFAFAF',   // MAPPED to colorTextQuaternary
        55: '#B5B5B5',
        50: '#BFBFBF',
        40: '#CECECE',   // MAPPED to colorBorder
        30: '#EBEBEB',   // MAPPED to colorBorderSecondary
        20: '#F3F3F3',
        10: '#F5F5F5',   // MAPPED to colorBgLayout
        0: '#FFFFFF',    // MAPPED to colorBgContainer, colorBgElevated
        '0-65': '#F5F5F5',
      },
      // TODO: Map to Ant Design Vue colorLink or colorInfo variants
      blue: {
        50: '#1890FF',
        10: '#E6F7FF',
      },
      
      // MAPPED: red[100] → colorError
      // TODO: Map red[10] → colorErrorBg, other shades → colorErrorBorder
      red: {
        130: '#CF1322',
        120: '#F5222D',
        110: '#FF2850',
        100: '#DA323C',  // MAPPED to colorError
        60: '#FF4D4F',
        50: '#FF4954',
        40: '#FF5A7A',
        10: '#FFF2F3',   // TODO: Map to colorErrorBg
      },
      
      // TODO: Map to Ant Design Vue colorWarning variants
      yellow: {
        100: '#FF922E',
        50: '#FFB12E',
        30: '#FFD52E',
        10: '#FFF7EA',
      },
      // TODO: Map to custom Alert or Tag component colors
      pink: {
        5: '#FDF6FA',
        10: '#FFF0F6',
        20: '#FFE3E9',
        40: '#FF91AF',
        50: '#EB2F96',
        60: '#FFBACA',
        70: '#D92B6B',
        80: '#FF91AF',
        90: '#D92B6B',
        95: '#B31B57',
        100: '#FF4081',
      },
      
      // TODO: Map green[10] → colorSuccessBg, other shades to success variants
      green: {
        100: '#0C924A',
        80: '#15A962',
        50: '#33C173',
        10: '#EBF9F1',   // TODO: Map to colorSuccessBg
      },
      
      // MAPPED: Primary brand color palette
      // purple[60] → colorPrimary, Button.colorPrimary
      // purple[50] → colorPrimaryHover, Button.colorPrimaryHover
      // purple[70] → colorPrimaryActive, Button.colorPrimaryActive
      // TODO: Map lighter shades (10-30) to hover/focus backgrounds
      purple: {
        100: '#2B0051',
        90: '#430379',
        80: '#5715A0',
        70: '#621BAF',   // MAPPED to colorPrimaryActive
        60: '#6A1EBB',   // MAPPED to colorPrimary (PRIMARY BRAND COLOR)
        55: '#7831C8',
        50: '#8644D4',   // MAPPED to colorPrimaryHover
        45: '#985AE2',
        40: '#A96FF0',
        35: '#BE92F8',
        30: '#D3B4FF',   // TODO: Map to focus/hover backgrounds
        25: '#DCC4FF',
        20: '#E6D4FF',
        15: '#F0E4FF',
        10: '#F9F5FF',   // TODO: Map to primary background variants
        5: '#EAF0FF',
      },
      
      // MAPPED: emerald[60] → colorSuccess
      // TODO: Map emerald[10] → colorSuccessBg, emerald[60] → colorSuccessBorder
      emerald: {
        100: '#062A27',
        90: '#0A4C47',
        80: '#0F6E65',
        70: '#13A181',
        60: '#16C49A',   // MAPPED to colorSuccess
        50: '#20E8B5',
        40: '#4EF1C5',
        30: '#93F5DA',
        20: '#D8FAEF',
        10: '#F5FFFC',   // TODO: Map to colorSuccessBg
      },
      
      // MAPPED: coral[60] → colorWarning
      // TODO: Map coral[10] → colorWarningBg, coral[60] → colorWarningBorder
      coral: {
        100: '#661D05',
        90: '#993310',
        80: '#CC471A',
        70: '#E65829',
        65: '#E65B29',
        60: '#FF7747',   // MAPPED to colorWarning
        50: '#FF9068',
        40: '#FFAD8C',
        30: '#FFCBB0',
        25: '#FFE5D6',
        20: '#FFF5D6',
        10: '#FFF5F0',   // TODO: Map to colorWarningBg
      },
      // TODO: Map to Ant Design Vue colorWhite token
      white: {
        100: '#FFFFFF',  // TODO: Map to colorWhite
      },
      
      // TODO: Map to Ant Design Vue colorBlack token
      black: {
        100: '#000000',  // TODO: Map to colorBlack
      },
      // TODO: Map all button colors to Ant Design Vue Button component tokens
      // These custom button colors should be mapped to Button component in theme.ts
      button: {
        focusOutline: '#89BEFA',    // TODO: Map to Button.primaryShadow
        text: '#FFFFFF',            // TODO: Map to Button.colorTextLightSolid
        // Colors for primary button - TODO: Map to Button component tokens
        primaryBg: '#348EF6',
        primaryBgHover: '#2E7FDB',
        primaryBgActive: '#2970C2',
        primaryTextDisable: '#ffffff',
        // Colors for secondary button - TODO: Map to Button.default* tokens
        secondaryBorderFocus: '#348EF6',
        secondaryBgHover: '#F2F7FF',
        secondaryBgActive: '#D8E9FD',
        secondaryTextActive: '#4F9BF3',
        secondaryTextDisable: '#282E3E',
        secondaryBorder: '#D3D7E1',
        secondaryText: '#282E3E',
        secondaryBgFocus: '#D8E9FD',
        // Colors for success button - TODO: Consider custom Button variant
        successBg: '#33c173',
        successBgHover: '#168c4d',
        successText: '#ffffff',
        successBgActive: '#2cb268',
        successBgFocus: '#12733f',
        // Color for danger button - TODO: Map to Button.danger* tokens
        dangerBgFocus: '#9E242C',
        dangerBg: '#D43F48',
        dangerBgHover: '#B82A33',
        dangerText: '#ffffff',
      },
      // TODO: Alternative neutral palette - map to Ant Design Vue neutral/fill tokens
      gray: {
        0: '#FFFFFF',   // TODO: Alternative for colorBgContainer
        10: '#FDFDFD',
        15: '#FAFAFA',
        20: '#F7F7F7',
        25: '#F3F3F3',
        30: '#F1F1F1',  // TODO: Map to colorFillQuaternary
        35: '#EBEBEB',  // TODO: Map to colorFillTertiary
        40: '#E3E3E3',  // TODO: Map to colorFillSecondary
        50: '#D4D4D4',  // TODO: Map to colorFill
        55: '#CCCCCC',
        60: '#B5B5B5',  // TODO: Alternative for colorTextPlaceholder
        70: '#8A8A8A',  // TODO: Alternative for colorTextTertiary
        80: '#616161',  // TODO: Alternative for colorTextSecondary
        90: '#4A4A4A',
        95: '#303030',
        100: '#1A1A1A', // TODO: Alternative for colorText
      },
      
      // TODO: Map to dark theme or custom brand variants
      indigo: {
        0: '#ffffff',
        10: '#f9f9ff',
        15: '#f0f4ff',
        20: '#e4e4f7',
        25: '#D2D2F2',
        30: '#c0c0e6',
        40: '#9b9bcc',
        50: '#7777aa',
        60: '#5a5a91',
        70: '#434373',
        80: '#3e3e5a',
        90: '#242442',
        95: '#252544',
        100: '#1a1a2e',
      },
    },
    // ============================================================
    // SPACING SCALE (imported from above)
    // Status: Available but not mapped to Ant Design Vue
    // TODO: Map to padding*, margin*, controlHeight* tokens in theme.ts
    // ============================================================
    spacing,
    
    // ============================================================
    // ANIMATIONS
    // Status: NOT MAPPED
    // TODO: Consider mapping to Ant Design Vue motion* tokens
    // ============================================================
    animation: {
      none: 'none',
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
    },
    backgroundColor: (theme) => theme('colors'),
    backgroundImage: {
      none: 'none',
      'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
      'gradient-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
      'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
      'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
      'gradient-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
      'gradient-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
      'gradient-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
    },
    backgroundOpacity: (theme) => theme('opacity'),
    backgroundPosition: {
      bottom: 'bottom',
      center: 'center',
      left: 'left',
      'left-bottom': 'left bottom',
      'left-top': 'left top',
      right: 'right',
      'right-bottom': 'right bottom',
      'right-top': 'right top',
      top: 'top',
    },
    backgroundSize: {
      auto: 'auto',
      cover: 'cover',
      contain: 'contain',
    },
    borderColor: (theme) => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.200', 'currentColor'),
    }),
    borderOpacity: (theme) => theme('opacity'),
    // ============================================================
    // BORDER RADIUS
    // Status: PARTIALLY MAPPED (DEFAULT hardcoded to 4px in theme.ts)
    // TODO: Map to Ant Design Vue borderRadius, borderRadiusLG, borderRadiusSM, borderRadiusXS
    // borderRadiusOuter tokens for nested components
    // ============================================================
    borderRadius: {
      none: '0px',
      sm: '0.125rem',    // 2px - TODO: Map to borderRadiusSM
      DEFAULT: '0.25rem', // 4px - MAPPED to borderRadius
      md: '0.375rem',    // 6px
      lg: '0.5rem',      // 8px - TODO: Map to borderRadiusLG
      xl: '0.75rem',     // 12px - TODO: Map to borderRadiusXS or custom value
      '2xl': '1rem',     // 16px
      '2.5xl': '1.25rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    borderWidth: {
      DEFAULT: '1px',
      0: '0px',
      0.5: '0.5px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    // ============================================================
    // BOX SHADOWS
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue boxShadow, boxShadowSecondary, boxShadowTertiary tokens
    // Component-specific shadows should be mapped to component tokens:
    // - card → Card.boxShadow
    // - dialog/panel/profile → Modal.boxShadow
    // - dropdown → Select/Dropdown.boxShadow
    // - input → Input shadow on focus
    // ============================================================
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',      // TODO: Map to boxShadowTertiary
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // TODO: Map to boxShadowSecondary
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // TODO: Map to boxShadow
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
      // Custom colored shadows - TODO: Consider for Button.primaryShadow etc.
      'blue-md': '0 4px 0px #621BAF',
      blue: '0px 3px 0px #621BAF',
      'yellow-md': '0px 4px 0px #FF922E',
      yellow: '0px 3px 0px #FF922E',
      'red-md': '0 4px 0 #DA323C',
      red: '0 3px 0 #DA323C',
      'base-md': '0px 4px 0px #DFE3E9',
      base: '0px 3px 0px #DFE3E9',
      'grey-md': '0px 4px 0px #D3D7E1',
      grey: '0px 3px 0px #D3D7E1',
      'green-md': '0px 4px 0px #15A962',
      green: '0px 3px 0px #15A962',
      'primary-75-md': '0 4px 0 #D3E6FD',
      'primary-75': '0 3px 0 #D3E6FD',
      // Component-specific shadows - TODO: Map to component tokens in theme.ts
      panel: '76.15px 55.15px 97.53px rgba(0, 0, 0, 0.06)',
      input: '0px 0px 0px 2px rgba(79, 154, 242, 0.2)',      // TODO: Map to Input focus shadow
      nav: 'inset 4px 4px 3px rgba(0, 0, 0, 0.25)',
      dropdown: '3px 3px 5px rgba(37, 42, 56, 0.1)',         // TODO: Map to Dropdown.boxShadow
      dialog: '5px 5px 20px rgba(37, 42, 56, 0.1)',          // TODO: Map to Modal.boxShadow
      card: '0px 1px 3px 0px rgba(211, 215, 225, 0.81)',     // TODO: Map to Card.boxShadow
      profile: '12px 20px 24px 0px rgba(37, 42, 56, 0.15)',
      top: '0px 4px 11px 0px rgba(0,0,0,0.08)',
      badge: '0px 2px 4px rgba(0, 0, 0, 0.1)',               // TODO: Map to Badge.boxShadow
    },
    container: {},
    cursor: {
      auto: 'auto',
      default: 'default',
      pointer: 'pointer',
      wait: 'wait',
      text: 'text',
      move: 'move',
      'not-allowed': 'not-allowed',
    },
    divideColor: (theme) => theme('borderColor'),
    divideOpacity: (theme) => theme('borderOpacity'),
    divideWidth: (theme) => theme('borderWidth'),
    fill: { current: 'currentColor' },
    flex: {
      1: '1 1 0%',
      auto: '1 1 auto',
      initial: '0 1 auto',
      none: 'none',
    },
    flexGrow: {
      0: '0',
      DEFAULT: '1',
    },
    flexShrink: {
      0: '0',
      DEFAULT: '1',
    },
    // ============================================================
    // FONT FAMILIES
    // Status: PARTIALLY MAPPED (sans is used for fontFamily token)
    // TODO: Consider mapping mono to fontFamilyCode token in Ant Design Vue
    // ============================================================
    fontFamily: {
      jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      sans: [                          // MAPPED to fontFamily token
        'Nunito',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: [                          // TODO: Map to fontFamilyCode
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    // ============================================================
    // FONT SIZES
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue fontSize, fontSizeSM, fontSizeLG, fontSizeXL tokens
    // TODO: Map heading sizes to fontSizeHeading1, fontSizeHeading2, etc.
    // ============================================================
    fontSize: {
      '3xs': ['0.375rem', { lineHeight: '0.375rem' }],
      '2xs': ['0.5rem', { lineHeight: '0.75rem' }],
      '1.5xs': ['0.625rem', { lineHeight: '0.875rem' }],
      xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px - TODO: Map to fontSizeXS
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - TODO: Map to fontSizeSM
      base: ['1rem', { lineHeight: '1.5rem' }],    // 16px - TODO: Map to fontSize
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - TODO: Map to fontSizeLG
      xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px - TODO: Map to fontSizeXL
      '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px - TODO: Map to fontSizeHeading5
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - TODO: Map to fontSizeHeading4
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - TODO: Map to fontSizeHeading3
      '5xl': ['3rem', { lineHeight: '1' }],           // 48px - TODO: Map to fontSizeHeading2
      '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px - TODO: Map to fontSizeHeading1
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
      'md14-h18': ['0.875rem', { lineHeight: '1.125rem' }],
    },
    // ============================================================
    // FONT WEIGHTS
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue fontWeightStrong token (typically 600)
    // ============================================================
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',     // TODO: Map to default font weight
      medium: '500',
      semibold: '600',   // TODO: Map to fontWeightStrong
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    gap: (theme) => theme('spacing'),
    gradientColorStops: (theme) => theme('colors'),
    gridAutoColumns: {
      auto: 'auto',
      min: 'min-content',
      max: 'max-content',
      fr: 'minmax(0, 1fr)',
    },
    gridAutoRows: {
      auto: 'auto',
      min: 'min-content',
      max: 'max-content',
      fr: 'minmax(0, 1fr)',
    },
    gridColumn: {
      auto: 'auto',
      'span-1': 'span 1 / span 1',
      'span-2': 'span 2 / span 2',
      'span-3': 'span 3 / span 3',
      'span-4': 'span 4 / span 4',
      'span-5': 'span 5 / span 5',
      'span-6': 'span 6 / span 6',
      'span-7': 'span 7 / span 7',
      'span-8': 'span 8 / span 8',
      'span-9': 'span 9 / span 9',
      'span-10': 'span 10 / span 10',
      'span-11': 'span 11 / span 11',
      'span-12': 'span 12 / span 12',
      'span-13': 'span 13 / span 13',
      'span-14': 'span 14 / span 14',
      'span-15': 'span 15 / span 15',
      'span-16': 'span 16 / span 16',
      'span-17': 'span 17 / span 17',
      'span-18': 'span 18 / span 18',
      'span-19': 'span 19 / span 19',
      'span-20': 'span 20 / span 20',
      'span-21': 'span 21 / span 21',
      'span-22': 'span 22 / span 22',
      'span-23': 'span 23 / span 23',
      'span-24': 'span 24 / span 24',
      'span-full': '1 / -1',
    },
    gridColumnEnd: {
      auto: 'auto',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
      13: '13',
      14: '14',
      15: '15',
      16: '16',
      17: '17',
      18: '18',
      19: '19',
      20: '20',
      21: '21',
      22: '22',
      23: '23',
      24: '24',
    },
    gridColumnStart: {
      auto: 'auto',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
      13: '13',
      14: '14',
      15: '15',
      16: '16',
      17: '17',
      18: '18',
      19: '19',
      20: '20',
      21: '21',
      22: '22',
      23: '23',
      24: '24',
    },
    gridRow: {
      auto: 'auto',
      'span-1': 'span 1 / span 1',
      'span-2': 'span 2 / span 2',
      'span-3': 'span 3 / span 3',
      'span-4': 'span 4 / span 4',
      'span-5': 'span 5 / span 5',
      'span-6': 'span 6 / span 6',
      'span-full': '1 / -1',
    },
    gridRowStart: {
      auto: 'auto',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
    },
    gridRowEnd: {
      auto: 'auto',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
    },
    transformOrigin: {
      center: 'center',
      top: 'top',
      'top-right': 'top right',
      right: 'right',
      'bottom-right': 'bottom right',
      bottom: 'bottom',
      'bottom-left': 'bottom left',
      left: 'left',
      'top-left': 'top left',
    },
    gridTemplateColumns: {
      none: 'none',
      1: 'repeat(1, minmax(0, 1fr))',
      2: 'repeat(2, minmax(0, 1fr))',
      3: 'repeat(3, minmax(0, 1fr))',
      4: 'repeat(4, minmax(0, 1fr))',
      5: 'repeat(5, minmax(0, 1fr))',
      6: 'repeat(6, minmax(0, 1fr))',
      7: 'repeat(7, minmax(0, 1fr))',
      8: 'repeat(8, minmax(0, 1fr))',
      9: 'repeat(9, minmax(0, 1fr))',
      10: 'repeat(10, minmax(0, 1fr))',
      11: 'repeat(11, minmax(0, 1fr))',
      12: 'repeat(12, minmax(0, 1fr))',
      13: 'repeat(13, minmax(0, 1fr))',
      14: 'repeat(14, minmax(0, 1fr))',
      15: 'repeat(15, minmax(0, 1fr))',
      16: 'repeat(16, minmax(0, 1fr))',
      17: 'repeat(17, minmax(0, 1fr))',
      18: 'repeat(18, minmax(0, 1fr))',
      19: 'repeat(19, minmax(0, 1fr))',
      20: 'repeat(20, minmax(0, 1fr))',
      21: 'repeat(21, minmax(0, 1fr))',
      22: 'repeat(22, minmax(0, 1fr))',
      23: 'repeat(23, minmax(0, 1fr))',
      24: 'repeat(24, minmax(0, 1fr))',
    },
    gridTemplateRows: {
      none: 'none',
      1: 'repeat(1, minmax(0, 1fr))',
      2: 'repeat(2, minmax(0, 1fr))',
      3: 'repeat(3, minmax(0, 1fr))',
      4: 'repeat(4, minmax(0, 1fr))',
      5: 'repeat(5, minmax(0, 1fr))',
      6: 'repeat(6, minmax(0, 1fr))',
    },
    height: (theme) => ({
      auto: 'auto',
      ...theme('spacing'),
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      '1/5': '20%',
      '2/5': '40%',
      '3/5': '60%',
      '4/5': '80%',
      '1/6': '16.666667%',
      '2/6': '33.333333%',
      '3/6': '50%',
      '4/6': '66.666667%',
      '5/6': '83.333333%',
      full: '100%',
      screen: '100vh',
    }),
    inset: (theme, { negative }) => ({
      auto: 'auto',
      ...theme('spacing'),
      ...negative(theme('spacing')),
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      full: '100%',
      '-1/2': '-50%',
      '-1/3': '-33.333333%',
      '-2/3': '-66.666667%',
      '-1/4': '-25%',
      '-2/4': '-50%',
      '-3/4': '-75%',
      '-full': '-100%',
    }),
    keyframes: {
      spin: {
        to: {
          transform: 'rotate(360deg)',
        },
      },
      ping: {
        '75%, 100%': {
          transform: 'scale(2)',
          opacity: '0',
        },
      },
      pulse: {
        '50%': {
          opacity: '.5',
        },
      },
      bounce: {
        '0%, 100%': {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
        },
        '50%': {
          transform: 'none',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
        },
      },
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    // ============================================================
    // LINE HEIGHTS
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue lineHeight, lineHeightSM, lineHeightLG tokens
    // TODO: Map to lineHeightHeading1-5 for heading line heights
    // ============================================================
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',    // TODO: Map to lineHeight
      relaxed: '1.625',
      loose: '2',
      3: '.75rem',
      4: '1rem',        // TODO: Map to lineHeightSM
      5: '1.25rem',
      6: '1.5rem',      // TODO: Map to lineHeight
      7: '1.75rem',
      8: '2rem',        // TODO: Map to lineHeightLG
      9: '2.25rem',
      10: '2.5rem',
    },
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
    },
    margin: (theme, { negative }) => ({
      auto: 'auto',
      ...theme('spacing'),
      ...negative(theme('spacing')),
    }),
    maxHeight: (theme, { breakpoints }) => ({
      none: 'none',
      0: '0rem',
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      '7xl': '80rem',
      full: '100%',
      screen: '100vh',
      min: 'min-content',
      max: 'max-content',
      ...theme('spacing'),
      ...breakpoints(theme('screens')),
    }),
    maxWidth: (theme) => ({
      ...theme('maxHeight'),
    }),
    minHeight: (theme) => ({
      ...theme('maxHeight'),
    }),
    minWidth: (theme) => ({
      ...theme('maxHeight'),
    }),
    objectPosition: {
      bottom: 'bottom',
      center: 'center',
      left: 'left',
      'left-bottom': 'left bottom',
      'left-top': 'left top',
      right: 'right',
      'right-bottom': 'right bottom',
      'right-top': 'right top',
      top: 'top',
    },
    opacity: {
      0: '0',
      5: '0.05',
      10: '0.1',
      20: '0.2',
      25: '0.25',
      30: '0.3',
      40: '0.4',
      50: '0.5',
      60: '0.6',
      65: '0.65',
      70: '0.7',
      75: '0.75',
      80: '0.8',
      90: '0.9',
      95: '0.95',
      100: '1',
    },
    order: {
      first: '-9999',
      last: '9999',
      none: '0',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
    },
    outline: {
      none: ['2px solid transparent', '2px'],
      white: ['2px dotted white', '2px'],
      black: ['2px dotted black', '2px'],
    },
    padding: (theme) => theme('spacing'),
    placeholderColor: (theme) => theme('colors'),
    placeholderOpacity: (theme) => theme('opacity'),
    ringColor: (theme) => ({
      DEFAULT: theme('colors.blue.500', '#3b82f6'),
      ...theme('colors'),
    }),
    ringOffsetColor: (theme) => theme('colors'),
    ringOffsetWidth: {
      0: '0px',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    ringOpacity: (theme) => ({
      DEFAULT: '0.5',
      ...theme('opacity'),
    }),
    ringWidth: {
      DEFAULT: '3px',
      0: '0px',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    rotate: {
      '-180': '-180deg',
      '-90': '-90deg',
      '-45': '-45deg',
      '-12': '-12deg',
      '-6': '-6deg',
      '-3': '-3deg',
      '-2': '-2deg',
      '-1': '-1deg',
      0: '0deg',
      1: '1deg',
      2: '2deg',
      3: '3deg',
      6: '6deg',
      12: '12deg',
      45: '45deg',
      90: '90deg',
      180: '180deg',
    },
    scale: {
      0: '0',
      50: '.5',
      75: '.75',
      90: '.9',
      95: '.95',
      100: '1',
      105: '1.05',
      110: '1.1',
      125: '1.25',
      150: '1.5',
    },
    skew: {
      '-12': '-12deg',
      '-6': '-6deg',
      '-3': '-3deg',
      '-2': '-2deg',
      '-1': '-1deg',
      0: '0deg',
      1: '1deg',
      2: '2deg',
      3: '3deg',
      6: '6deg',
      12: '12deg',
    },
    space: (theme, { negative }) => ({
      ...theme('spacing'),
      ...negative(theme('spacing')),
    }),
    stroke: {
      current: 'currentColor',
    },
    strokeWidth: {
      0: '0',
      1: '1',
      2: '2',
    },
    textColor: (theme) => theme('colors'),
    textOpacity: (theme) => theme('opacity'),
    // ============================================================
    // TRANSITION DURATIONS
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue motion tokens:
    // - 100ms → motionDurationFast
    // - 200ms → motionDurationMid
    // - 300-500ms → motionDurationSlow
    // ============================================================
    transitionDuration: {
      DEFAULT: '150ms',
      75: '75ms',
      100: '100ms',   // TODO: Map to motionDurationFast
      150: '150ms',
      200: '200ms',   // TODO: Map to motionDurationMid
      300: '300ms',   // TODO: Map to motionDurationSlow
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    transitionDelay: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    transitionProperty: {
      none: 'none',
      all: 'all',
      DEFAULT: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
    },
    // ============================================================
    // TRANSITION TIMING FUNCTIONS
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue easing tokens:
    // - in-out → motionEaseInOut
    // - in → motionEaseIn, motionEaseInBack, motionEaseInCirc
    // - out → motionEaseOut, motionEaseOutBack, motionEaseOutCirc
    // ============================================================
    transitionTimingFunction: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // TODO: Map to motionEaseInOut
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',        // TODO: Map to motionEaseIn
      out: 'cubic-bezier(0, 0, 0.2, 1)',       // TODO: Map to motionEaseOut
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',// TODO: Map to motionEaseInOut
    },
    translate: (theme, { negative }) => ({
      ...theme('spacing'),
      ...negative(theme('spacing')),
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      full: '100%',
      '-1/2': '-50%',
      '-1/3': '-33.333333%',
      '-2/3': '-66.666667%',
      '-1/4': '-25%',
      '-2/4': '-50%',
      '-3/4': '-75%',
      '-full': '-100%',
    }),
    width: (theme) => ({
      auto: 'auto',
      ...theme('spacing'),
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      '1/5': '20%',
      '2/5': '40%',
      '3/5': '60%',
      '4/5': '80%',
      '1/6': '16.666667%',
      '2/6': '33.333333%',
      '3/6': '50%',
      '4/6': '66.666667%',
      '5/6': '83.333333%',
      '1/12': '8.333333%',
      '2/12': '16.666667%',
      '3/12': '25%',
      '4/12': '33.333333%',
      '5/12': '41.666667%',
      '6/12': '50%',
      '7/12': '58.333333%',
      '8/12': '66.666667%',
      '9/12': '75%',
      '10/12': '83.333333%',
      '11/12': '91.666667%',
      full: '100%',
      screen: '100vw',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    }),
    // ============================================================
    // Z-INDEX SCALE
    // Status: NOT MAPPED
    // TODO: Map to Ant Design Vue zIndexBase, zIndexPopupBase tokens
    // Ant Design uses specific z-index values for layering (typically 1000+)
    // ============================================================
    zIndex: {
      auto: 'auto',
      0: '0',
      1: '1',
      5: '5',
      10: '10',       // TODO: Consider for zIndexBase
      20: '20',
      30: '30',
      40: '40',
      50: '50',       // TODO: Consider for zIndexPopupBase
    },
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
  ],
  variants: {
    accessibility: ['responsive', 'focus-within', 'focus'],
    alignContent: ['responsive'],
    alignItems: ['responsive'],
    alignSelf: ['responsive'],
    animation: ['responsive'],
    appearance: ['responsive'],
    backgroundAttachment: ['responsive'],
    backgroundClip: ['responsive'],
    backgroundColor: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus', 'active'],
    backgroundImage: ['responsive'],
    backgroundOpacity: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    backgroundPosition: ['responsive'],
    backgroundRepeat: ['responsive'],
    backgroundSize: ['responsive'],
    borderCollapse: ['responsive'],
    borderColor: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus'],
    borderOpacity: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    borderRadius: ['responsive'],
    borderStyle: ['responsive'],
    borderWidth: ['responsive'],
    boxShadow: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus', 'active'],
    boxSizing: ['responsive'],
    clear: ['responsive'],
    container: ['responsive'],
    cursor: ['responsive'],
    display: ['responsive', 'group-hover'],
    divideColor: ['responsive', 'dark'],
    divideOpacity: ['responsive'],
    divideStyle: ['responsive'],
    divideWidth: ['responsive'],
    fill: ['responsive'],
    flex: ['responsive'],
    flexDirection: ['responsive'],
    flexGrow: ['responsive'],
    flexShrink: ['responsive'],
    flexWrap: ['responsive'],
    float: ['responsive'],
    fontFamily: ['responsive'],
    fontSize: ['responsive'],
    fontSmoothing: ['responsive'],
    fontStyle: ['responsive'],
    fontVariantNumeric: ['responsive'],
    fontWeight: ['responsive'],
    gap: ['responsive'],
    gradientColorStops: ['responsive', 'dark', 'hover', 'focus'],
    gridAutoColumns: ['responsive'],
    gridAutoFlow: ['responsive'],
    gridAutoRows: ['responsive'],
    gridColumn: ['responsive'],
    gridColumnEnd: ['responsive'],
    gridColumnStart: ['responsive'],
    gridRow: ['responsive'],
    gridRowEnd: ['responsive'],
    gridRowStart: ['responsive'],
    gridTemplateColumns: ['responsive'],
    gridTemplateRows: ['responsive'],
    height: ['responsive'],
    inset: ['responsive', 'hover', 'active'],
    justifyContent: ['responsive'],
    justifyItems: ['responsive'],
    justifySelf: ['responsive'],
    letterSpacing: ['responsive'],
    lineHeight: ['responsive'],
    listStylePosition: ['responsive'],
    listStyleType: ['responsive'],
    margin: ['responsive'],
    maxHeight: ['responsive'],
    maxWidth: ['responsive'],
    minHeight: ['responsive'],
    minWidth: ['responsive'],
    objectFit: ['responsive'],
    objectPosition: ['responsive'],
    opacity: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    order: ['responsive'],
    outline: ['responsive', 'focus-within', 'focus'],
    overflow: ['responsive'],
    overscrollBehavior: ['responsive'],
    padding: ['responsive'],
    placeContent: ['responsive'],
    placeItems: ['responsive'],
    placeSelf: ['responsive'],
    placeholderColor: ['responsive', 'dark', 'focus'],
    placeholderOpacity: ['responsive', 'focus'],
    pointerEvents: ['responsive'],
    position: ['responsive'],
    resize: ['responsive'],
    ringColor: ['responsive', 'dark', 'focus-within', 'focus'],
    ringOffsetColor: ['responsive', 'dark', 'focus-within', 'focus'],
    ringOffsetWidth: ['responsive', 'focus-within', 'focus'],
    ringOpacity: ['responsive', 'focus-within', 'focus'],
    ringWidth: ['responsive', 'focus-within', 'focus'],
    rotate: ['responsive', 'hover', 'focus'],
    scale: ['responsive', 'hover', 'focus'],
    skew: ['responsive', 'hover', 'focus'],
    space: ['responsive'],
    stroke: ['responsive'],
    strokeWidth: ['responsive'],
    tableLayout: ['responsive'],
    textAlign: ['responsive'],
    textColor: ['responsive', 'dark', 'group-hover', 'focus-within', 'hover', 'focus', 'active'],
    textDecoration: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    textOpacity: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    textOverflow: ['responsive'],
    textTransform: ['responsive'],
    transform: ['responsive'],
    transformOrigin: ['responsive'],
    transitionDelay: ['responsive'],
    transitionDuration: ['responsive'],
    transitionProperty: ['responsive'],
    transitionTimingFunction: ['responsive'],
    translate: ['responsive', 'hover', 'focus', 'active'],
    userSelect: ['responsive'],
    verticalAlign: ['responsive'],
    visibility: ['responsive'],
    whitespace: ['responsive'],
    width: ['responsive'],
    wordBreak: ['responsive'],
    zIndex: ['responsive', 'focus-within', 'focus'],
  },
  plugins: [],
  corePlugins: {
    animation: false,
  },
}


