import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

/**
 * Base theme configuration for Aha Slide applications using Ant Design.
 */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#6A1EBB',
    colorPrimaryHover: '#8644D4',
    colorSuccess: '#16C49A',
    colorWarning: '#FF7747',
    colorError: '#D1303A',
    colorInfo: '#9BB3E9',
  },
  components: {
    Button: {
      colorPrimary: '#6A1EBB',
      colorPrimaryHover: '#8644D4',
    }
  }
};
