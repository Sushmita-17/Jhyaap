import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-64.png', 'logo-128.png', 'logo-192.png', 'logo-256.png', 'logo-512.png'],
      manifest: {
        name: 'Jhyaap Station - Night Liquor Delivery',
        short_name: 'Jhyaap Station',
        description: 'Late-night alcohol delivery across Kathmandu Valley. Order whisky, vodka, wine, beer and more delivered to your doorstep between 10 PM - 4 AM.',
        theme_color: '#F5A623',
        background_color: '#1C1410',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/logo-64.png',
            sizes: '64x64',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo-256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Order Now',
            short_name: 'Order',
            description: 'Browse products and place an order',
            url: '/',
            icons: [
              {
                src: '/logo-192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'Track Order',
            short_name: 'Track',
            description: 'Track your live order status',
            url: '/order-tracking',
            icons: [
              {
                src: '/logo-192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3004,
    host: true
  },
  optimizeDeps: {
    include: ['react-leaflet', 'leaflet'],
    force: true
  },
  define: {
    global: 'globalThis',
  }
})
