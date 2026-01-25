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
    aha: async (name) => {
      // Transform system-* to aha-* to match file names
      let fileName = name.replace('system-', 'aha-')
      
      // Handle special cases with characters that don't work in file names
      const specialCases = {
        'aha-q&a': 'aha-qna',
        // Add more special cases here if needed
      }
      
      if (specialCases[fileName]) {
        fileName = specialCases[fileName]
      }
      
      const filePath = resolve(__dirname, './icons', `${fileName}.svg`)
      
      try {
        const fs = await import('fs/promises')
        const svg = await fs.readFile(filePath, 'utf-8')
        return svg.replace(/^<svg /, '<svg fill="currentColor" ')
      } catch (error) {
        console.warn(`Icon not found: ${filePath}`)
        return null
      }
    },
  },
  autoInstall: false,
})

export default ahaViteIconPlugin