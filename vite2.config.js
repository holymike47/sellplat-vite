import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../sellplat-boot/src/main/resources/static', // Path to Spring Boot static folder
    emptyOutDir: true
  }
})