import { defineConfig } from 'vite';

// base: './' => relative Asset-Pfade, damit der Build sowohl unter einer
// GitHub-Pages-Projektseite (…github.io/websiten-/) als auch am Root lädt.
export default defineConfig({
  base: './'
});
