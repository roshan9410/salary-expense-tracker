import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/salary-expense-tracker/',

  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['pwa-192.svg', 'pwa-512.svg'],
    manifest: {
      name: 'Salary vs Expenses',
      short_name: 'Expenses',
      description: 'A fast daily salary and expense tracker.',
      theme_color: '#142747',
      background_color: '#f4f7fc',
      display: 'standalone',

      start_url: '/salary-expense-tracker/',
      scope: '/salary-expense-tracker/',

      icons: [
        { src: '/salary-expense-tracker/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/salary-expense-tracker/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    },

    workbox: {
      navigateFallback: '/salary-expense-tracker/index.html',
      globPatterns: ['**/*.{js,css,html,svg,ico,png}']
    }
  })]
})