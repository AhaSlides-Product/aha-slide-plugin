/** @type {import('tailwindcss').Config} */
import baseConfig from '@aha/ui/tailwind.config';

export default {
  // Extend the base configuration from @aha/ui
  ...baseConfig,
  
  // Override content paths to scan this app's files
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    // Also scan @aha/ui components if they use Tailwind classes
    './node_modules/@aha/ui/dist/**/*.{js,ts,vue}',
  ],
  
  // You can extend or override theme values here if needed
  theme: {
    ...baseConfig.theme,
    extend: {
      // Add app-specific customizations here
      // Example: 
      // colors: {
      //   'app-primary': '#custom-color',
      // }
    },
  },
  
  // Inherit plugins from base config
  plugins: baseConfig.plugins || [],
};

