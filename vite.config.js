import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        // MIME type para .m3u8 (Playlist HLS)
        if (req.url.endsWith('.m3u8')) {
          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        }
        // MIME type para .ts (Segmentos de Vídeo)
        if (req.url.endsWith('.ts')) {
          res.setHeader('Content-Type', 'video/mp2t')
        }
        next()
      })
    }
  }
})
