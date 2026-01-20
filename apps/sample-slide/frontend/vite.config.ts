import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: 'vue3',
      customCollections: {
        // Custom Aha icons from the @aha/ui package
        aha: FileSystemIconLoader(
          path.resolve(__dirname, '../../../packages/ui/src/system-icons'),
          (svg) => svg.replace(/^<svg /, '<svg stroke="currentColor" ')
        ),
      },
      autoInstall: true,
    }),
  ],
})
