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
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      PUBLIC_MIXPANEL_TOKEN: envField.string({ context: 'client', access: 'public', optional: true }),
    }
  },
  
});