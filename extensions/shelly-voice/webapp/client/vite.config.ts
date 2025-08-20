import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      process.env.ALLOWED_HOST || 'localhost',
      'voice-agent-app-tunnel-izsqs6wm.devinapps.com',
    ],
  },
})
