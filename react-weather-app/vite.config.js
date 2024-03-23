import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Specify MIME types for specific file extensions
    // For example, to ensure that .js files are served with the correct MIME type
    mimeTypes: {
      '.js': 'text/javascript',
    },
  },
})
