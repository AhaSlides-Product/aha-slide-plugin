import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import path from 'path'

export const ahaViteIconPlugin = Icons({
  compiler: 'vue3',
  customCollections: {
    // Custom Aha icons from the @aha/ui package
    aha: FileSystemIconLoader(
      path.resolve(__dirname, './icons'),
    ),
  },
  autoInstall: true,
})

export default ahaViteIconPlugin