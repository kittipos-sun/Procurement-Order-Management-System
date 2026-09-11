import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* global process */

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'replace-api-origin',
      transform(code, id) {
        if (!id.includes('/src/')) return null;
        const apiOrigin = JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3000');
        const replacement = apiOrigin.slice(1, -1);
        const replaced = code.replaceAll('http://localhost:3000', replacement);
        return replaced === code ? null : { code: replaced, map: null };
      }
    }
  ],
})
