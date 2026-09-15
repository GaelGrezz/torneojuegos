import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        videojuegos: resolve(import.meta.dirname, 'videojuegos.html'),
        jugadores: resolve(import.meta.dirname, 'jugadores.html'),
      },
    },
  },
});
