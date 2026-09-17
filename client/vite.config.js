import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        videojuegos: resolve(import.meta.dirname, 'videojuegos.html'),
        generos: resolve(import.meta.dirname, 'generos.html'),
        jugadores: resolve(import.meta.dirname, 'jugadores.html'),
      },
    },
  },
});
