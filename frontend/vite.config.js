import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define:{
    'process.env.VITE_API_KEY' : JSON.stringify(process.env.VITE_API_KEY)
  },
  build: {
    outDir: 'dist', 
  },
  server: {
    port: 5173,
  }
})
