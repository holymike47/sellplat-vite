import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    emptyOutDir: true,
    sourcemap:true
  }
  // ,
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:8081',
  //       changeOrigin: true
  //     }
  //   }
  // }
})