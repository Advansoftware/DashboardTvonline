import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createServer } from 'https';
import { readFileSync } from 'fs';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    https: {
      key: readFileSync('./cert/localhost-key.pem'),
      cert: readFileSync('./cert/localhost.pem')
    },
    proxy: {
      '/api': {
        target: 'http://atmosbr.online',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '') // Reescreve as rotas para remover o prefixo "/api"
      }
    }
  }
});
