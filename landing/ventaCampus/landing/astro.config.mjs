// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  server: {
    host: true, // Expone automáticamente el servidor a toda la red local (0.0.0.0)
    port: 4321,
  },
});
