import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";

const BOOT_FILE = fileURLToPath(
  new URL("./src/shared/boot/boot.ts", import.meta.url),
);

/**
 * The boot kernel (theme + language resolution, translate hints) has to run
 * before the first paint and before the browser's own language detection, so
 * it cannot be a deferred module. It is written once in TypeScript, compiled
 * here and inlined into <head>. The React app imports the very same file.
 */
function inlineBoot(): Plugin {
  return {
    name: "kyrelix:inline-boot",
    async transformIndexHtml(html) {
      const source = await readFile(BOOT_FILE, "utf8");
      const { code } = await transformWithEsbuild(
        // the file is a regular ES module for the app; for the inline copy drop `export` and call bootstrap()
        `${source.replace(/^export\s+/gm, "")}\nbootstrap();\n`,
        BOOT_FILE,
        { loader: "ts", format: "iife", minify: true, target: "es2019" },
      );
      return html.replace(
        "<!--kyrelix:boot-->",
        () => `<script>${code}</script>`,
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [react(), inlineBoot()],
  server: { port: 5180 },
  preview: { port: 5181 },
  build: {
    // three.js is a lazy chunk (widgets/scene3d), loaded after the page is interactive
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": ["framer-motion"],
          "vendor-state": ["zustand"],
          // 3D: loaded lazily, after the page is up (see widgets/scene3d/Scene3D.tsx)
          "vendor-three": ["three"],
          "vendor-r3f": ["@react-three/fiber"],
        },
      },
    },
  },
});
