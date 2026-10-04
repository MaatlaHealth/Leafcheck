import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Everything the core flow needs is precached by the service worker:
// app shell, TF.js chunk, strings, model files and audio clips.
export default defineConfig({
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 4000,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Leihlo',
        short_name: 'Leihlo',
        description: "The extension officer's eye on your farm.",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f6f3ea',
        theme_color: '#2f5d34',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,bin,mp3,png,svg,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/\.netlify\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
