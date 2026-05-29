import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard Vite multi-file build.
// base: './' makes the same output work locally (npm run preview),
// on GitHub Pages at any subpath, and from a static file host.
// No singlefile plugin: additional fonts can be loaded at runtime
// via FontFace API or <link rel="stylesheet"> injection.
export default defineConfig({
  plugins: [react()],
  base: './',
});