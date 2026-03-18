// @ts-check
import { defineConfig, envField } from 'astro/config';
import svelte from '@astrojs/svelte';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  adapter: netlify({
    edgeMiddleware: false,
  }),
  output: 'static',
  vite: {
    // @ts-expect-error
    plugins: [tailwindcss()],
  },
  env: {
    validateSecrets: true,
    schema: {
      BUILD_HOOK_URL: envField.string({ context: 'server', access: 'secret', optional: false }),
    }
  },
});