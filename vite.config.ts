import { defineConfig } from 'vitest/config';

// Configuração do Vite. O PWA (service worker) entra na Fase 3.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
  test: { include: ['tests/**/*.test.ts'] },
});
