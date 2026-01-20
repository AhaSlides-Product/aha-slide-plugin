import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { ahaViteIconPlugin } from '@aha/ui/vite.config.icon'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    ahaViteIconPlugin,
  ],
})
