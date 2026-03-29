import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/max_bot_miniapp/',
  plugins: [react(), sentryVitePlugin({
    org: "avtoto-chatbot",
    project: "javascript-react"
  })],

  build: {
    sourcemap: true
  }
})