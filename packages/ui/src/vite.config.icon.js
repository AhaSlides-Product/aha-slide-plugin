import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const ahaViteIconPlugin = Icons({
  compiler: 'vue3',
  customCollections: {
    // Custom Aha icons from the @aha/ui package
    aha: FileSystemIconLoader(
      resolve(__dirname, './icons'),
    ),
  },
  autoInstall: true,
})

export default ahaViteIconPlugin