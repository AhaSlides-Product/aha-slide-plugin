/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Test colors - from @aha/ui
        purple: {
          50: '#8644D4',
          60: '#6A1EBB',
          70: '#621BAF',
        },
        emerald: {
          10: '#F5FFFC',
          60: '#16C49A',
        },
        coral: {
          10: '#FFF5F0',
          60: '#FF7747',
        },
        red: {
          50: '#FF4954',
          100: '#DA323C',
        },
        base: {
          0: '#FFFFFF',
          10: '#F5F5F5',
          20: '#F3F3F3',
          30: '#EBEBEB',
          40: '#CECECE',
          50: '#BFBFBF',
          60: '#AFAFAF',
          70: '#999999',
          80: '#707070',
          90: '#4B4B4B',
          100: '#0A0A0A',
        },
        yellow: {
          10: '#FFF7EA',
          50: '#FFB12E',
        },
      },
    },
  },
};
