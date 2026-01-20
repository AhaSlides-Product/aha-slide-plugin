import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ahaViteIconPlugin } from '@aha/ui/vite.config.icon'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ahaViteIconPlugin,
  ],
})
