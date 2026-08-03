import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/extension.ts'),
      formats: ['cjs'],
      fileName: 'extension'
    },
    rollupOptions: {
      external: [
        'vscode',
        /^node:/,
      ]
    }
  }
});
