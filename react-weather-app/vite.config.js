import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Specify MIME types for specific file extensions
    mimeTypes: {
      '.js': 'application/javascript', // Corrected MIME type for JavaScript files
    },
  },
});
