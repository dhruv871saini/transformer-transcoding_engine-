import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const backend =
    env.VITE_DEV_PROXY_TARGET ||
    process.env.VITE_DEV_PROXY_TARGET ||
    "http://localhost:3000";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },
    server: {
      port: 5173,
      proxy: {
        "/videos": { target: backend, changeOrigin: true },
        "/upload": { target: backend, changeOrigin: true },
        "/hls-outputs": { target: backend, changeOrigin: true },
      },
    },
  };
});
