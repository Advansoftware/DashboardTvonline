import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createServer } from 'https';
import { readFileSync } from 'fs';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
   
    proxy: {
      '/atmosiptv': {
        target: 'http://atmosbr.online:80',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/atmosiptv/, '') // Reescreve as rotas para remover o prefixo "/api"
      }
    }
  }
});
