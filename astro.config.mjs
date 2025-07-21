// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://see-in-the-sea.lucio-dalessa.workers.dev",
  integrations: [mdx(), sitemap(), react()],
  vite: {
		plugins: [tanstackRouter(
      {target: "react", autoCodeSplitting: true,
            routesDirectory: "./src/react/routes",
            generatedRouteTree: "./src/react/generated.ts",
      }
    )],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      } || {},
    },
	},
  server: {
    open: true,
  },
  adapter: cloudflare(),
});