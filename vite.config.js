import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import istanbul from "vite-plugin-istanbul";
import { syncPodcastCsv } from "./scripts/podcastCsvSync.js";

const podcastDataSyncPlugin = () => {
  const handler = async (_req, res) => {
    try {
      const result = await syncPodcastCsv();
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Poddata-Source", result.source);
      res.end(result.csvText);
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ message: error.message }));
    }
  };

  return {
    name: "podcast-data-sync",
    configureServer(server) {
      server.middlewares.use("/api/podcast-data", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/podcast-data", handler);
    },
  };
};

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: ["src/**/*.js", "src/**/*.jsx"],
      extension: [".js", ".jsx"],
      requireEnv: false,
      forceBuildInstrument: true,
    }),
    podcastDataSyncPlugin(),
  ],
});
