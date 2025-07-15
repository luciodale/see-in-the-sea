// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import { defineConfig } from "astro/config";
import mkcert from 'vite-plugin-mkcert';

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap(), react()],
  vite: {
		plugins: [tanstackRouter(
      {target: "react", autoCodeSplitting: true,
            routesDirectory: "./src/react/routes",
            generatedRouteTree: "./src/react/generated.ts",
      }
    ), mkcert() ]
	},
  server: {
    open: true,

  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});