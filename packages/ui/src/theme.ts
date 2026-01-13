import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import tailwindConfig from '../tailwind.config.js';

// Extract colors from Tailwind config
const colors = tailwindConfig.theme.colors;
const spacing = tailwindConfig.theme.spacing;
const borderRadius = tailwindConfig.theme.borderRadius;
const boxShadow = tailwindConfig.theme.boxShadow;
const fontSize = tailwindConfig.theme.fontSize;

/**
 * Base theme configuration for Aha Slide applications using Ant Design.
 * Colors are sourced from the Tailwind config to maintain design consistency.
 * 
 * NOTE: This theme uses a subset of available Ant Design Vue tokens.
 * See comments below for tokens that could be mapped from Tailwind config.
 */
export const theme: ThemeConfig = {
  token: {
    // ============================================================
    // COLOR TOKENS - CURRENTLY MAPPED
    // ============================================================

    // Primary colors from Tailwind purple palette
    colorPrimary: colors.purple[60],         // #6A1EBB
    colorPrimaryHover: colors.purple[50],    // #8644D4
    colorPrimaryActive: colors.purple[70],   // #621BAF

    // Semantic colors from Tailwind palettes
    colorSuccess: colors.emerald[60],        // #16C49A
    colorWarning: colors.coral[60],          // #FF7747
    colorError: colors.red[100],             // #DA323C
    colorInfo: colors.primary[80],           // #D3B4FF

    // Border colors
    colorBorder: colors.base[40],            // #CECECE
    colorBorderSecondary: colors.base[30],   // #EBEBEB

    // Background colors
    colorBgContainer: colors.base[0],        // #FFFFFF
    colorBgLayout: colors.base[10],          // #F5F5F5
    colorBgElevated: colors.base[0],         // #FFFFFF

    // Text colors
    colorText: colors.base[100],             // #0A0A0A
    colorTextSecondary: colors.base[80],     // #707070
    colorTextTertiary: colors.base[70],      // #999999
    colorTextQuaternary: colors.base[60],    // #AFAFAF

    // ============================================================
    // TYPOGRAPHY TOKENS - CURRENTLY MAPPED
    // ============================================================

    fontFamily: tailwindConfig.theme.fontFamily.sans.join(', '),
    // TODO: Map fontSize tokens from Tailwind (see tailwind.config.js fontSize section)
    // Available: fontSize, fontSizeHeading1-5, fontSizeSM, fontSizeLG, fontSizeXL

    // TODO: Map lineHeight tokens from Tailwind (see tailwind.config.js lineHeight section)
    // Available: lineHeight, lineHeightHeading1-5, lineHeightSM, lineHeightLG

    // TODO: Map fontWeight tokens from Tailwind (see tailwind.config.js fontWeight section)
    // Available: fontWeightStrong (for bold text)

    // ============================================================
    // SPACING & SIZING TOKENS - NOT YET MAPPED
    // ============================================================

    // TODO: Map borderRadius tokens from Tailwind (see tailwind.config.js borderRadius section)
    borderRadius: 4, // Currently hardcoded, could use: borderRadius.DEFAULT, borderRadiusLG, borderRadiusSM, borderRadiusXS
    // TODO: controlHeight, controlHeightSM, controlHeightLG, controlHeightXS

    // TODO: Map padding/margin tokens from Tailwind spacing (see tailwind.config.js spacing section)
    // Available: padding, paddingXS, paddingSM, paddingLG, paddingXL
    // Available: margin, marginXS, marginSM, marginLG, marginXL, marginXXL, marginXXS

    // ============================================================
    // SHADOW & EFFECTS TOKENS - NOT YET MAPPED
    // ============================================================

    // TODO: Map boxShadow tokens from Tailwind (see tailwind.config.js boxShadow section)
    // Available: boxShadow, boxShadowSecondary, boxShadowTertiary
    // Tailwind has: sm, DEFAULT, md, lg, xl, 2xl, blue, yellow, red, green, etc.

    // ============================================================
    // COLOR TOKENS - NOT YET MAPPED
    // ============================================================

    // TODO: Additional color tokens that could be mapped:
    // - colorLink (links) - could use colors.blue[50] or colors.purple[60]
    // - colorTextDisabled - could use colors.base[50]
    // - colorTextPlaceholder - could use colors.base[60]
    // - colorTextHeading - could use colors.base[100]
    // - colorTextLabel - could use colors.base[90]
    // - colorTextDescription - could use colors.base[70]

    // - colorBgSpotlight - for highlighted backgrounds
    // - colorBgMask - for modal masks - could use rgba of colors.base[100]
    // - colorBgTextHover - for text hover backgrounds
    // - colorBgTextActive - for text active backgrounds

    // - colorFill - fill color for skeleton, empty state
    // - colorFillSecondary
    // - colorFillTertiary
    // - colorFillQuaternary

    // - colorErrorBg - error background color
    // - colorErrorBorder - error border color
    // - colorWarningBg - warning background color
    // - colorWarningBorder - warning border color
    // - colorSuccessBg - success background color
    // - colorSuccessBorder - success border color
    // - colorInfoBg - info background color
    // - colorInfoBorder - info border color

    // - colorHighlight - for search highlights
    // - colorWhite - pure white - could use colors.white[100]
    // - colorBlack - pure black - could use colors.black[100]

    // ============================================================
    // MOTION TOKENS - NOT YET MAPPED
    // ============================================================

    // TODO: Animation durations (could map from Tailwind transitionDuration)
    // Available: motionDurationFast, motionDurationMid, motionDurationSlow

    // TODO: Animation timing functions (could map from Tailwind transitionTimingFunction)
    // Available: motionEaseInOut, motionEaseIn, motionEaseOut, motionEaseInBack, motionEaseOutBack, motionEaseInCirc, motionEaseOutCirc

    // ============================================================
    // OTHER TOKENS - NOT YET MAPPED
    // ============================================================

    // TODO: wireframe (boolean) - determines whether to show borders on components
    // TODO: zIndexBase, zIndexPopupBase - z-index base values (see tailwind.config.js zIndex section)
    // TODO: opacityLoading - opacity for loading states
    // TODO: linkDecoration, linkHoverDecoration, linkFocusDecoration
  },

  // ============================================================
  // COMPONENT-SPECIFIC TOKENS
  // ============================================================
  components: {
    Button: {
      colorPrimary: colors.purple[60],
      colorPrimaryHover: colors.purple[50],
      colorPrimaryActive: colors.purple[70],
      // TODO: Add more button tokens:
      // - dangerColor, defaultBg, defaultBorderColor, defaultColor, defaultGhostColor
      // - ghostBg, primaryShadow, dangerShadow
      // - contentFontSize, contentFontSizeLG, contentFontSizeSM
      // - controlHeight, controlHeightLG, controlHeightSM
    },

    // TODO: Add component tokens for other commonly used components:

    // Input: {
    //   colorBorder: colors.secondary[20],
    //   colorBgContainer: colors.base[0],
    //   colorText: colors.base[100],
    //   colorTextPlaceholder: colors.base[60],
    //   controlHeight: ...,
    // },

    // Card: {
    //   colorBorderSecondary: colors.base[30],
    //   colorBgContainer: colors.base[0],
    //   boxShadow: boxShadow.card,
    // },

    // Modal: {
    //   colorBgMask: 'rgba(0, 0, 0, 0.45)',
    //   boxShadow: boxShadow.dialog,
    // },

    // Table: {
    //   colorBorderSecondary: colors.base[30],
    //   colorBgContainer: colors.base[0],
    //   colorFillAlter: colors.base[10],
    // },

    // Select: {
    //   colorBorder: colors.secondary[20],
    //   colorBgContainer: colors.base[0],
    //   colorBgElevated: colors.base[0],
    // },

    // Form: {
    //   labelColor: colors.base[100],
    //   labelFontSize: fontSize.sm,
    // },

    // Typography: {
    //   colorText: colors.base[100],
    //   colorTextSecondary: colors.base[80],
    //   fontSizeHeading1-5: fontSize['5xl'], fontSize['4xl'], etc.
    // },

    // Alert: {
    //   colorSuccessBg: colors.emerald[10],
    //   colorSuccessBorder: colors.emerald[60],
    //   colorErrorBg: colors.red[10],
    //   colorErrorBorder: colors.red[100],
    //   colorWarningBg: colors.coral[10],
    //   colorWarningBorder: colors.coral[60],
    //   colorInfoBg: colors.primary[50],
    //   colorInfoBorder: colors.primary[80],
    // },
  }
};
