import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import { LOCALES } from "./src/shared/boot/boot";
import { en } from "./src/shared/i18n/dictionaries/en";
import { renderSeoHead } from "./src/shared/seo/metadata";

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
      return html
        .replace("<!--kyrelix:boot-->", () => `<script>${code}</script>`)
        .replace(
          "<!--kyrelix:seo-->",
          () =>
            `<!--kyrelix:seo:start-->\n    ${renderSeoHead("en", en)}\n    <!--kyrelix:seo:end-->`,
        );
    },
    configureServer(server) {
      const codes = LOCALES.filter((item) => item.code !== "en")
        .map((item) => item.code)
        .join("|");
      const route = new RegExp(`^/(?:${codes})(?:/(?:index\\.html)?)?$`);
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        if (route.test(url.pathname)) request.url = `/index.html${url.search}`;
        next();
      });
    },
  };
}

const SLIM_THREE = fileURLToPath(
  new URL("./src/widgets/scene3d/three-slim.ts", import.meta.url),
);

/**
 * react-three-fiber registers the whole of three.js (`extend(THREE)`), which defeats tree shaking.
 * In production builds every import of "three" except the one inside three-slim.ts itself is
 * redirected to that file, which re-exports only the classes the site uses.
 */
function slimThree(): Plugin {
  return {
    name: "kyrelix:slim-three",
    apply: "build",
    enforce: "pre",
    resolveId(source, importer) {
      if (source !== "three" || importer === SLIM_THREE) return null;
      return SLIM_THREE;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  base: "./",
  // A missing static page must return 404 instead of another copy of the English landing page.
  appType: "mpa",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [react(), inlineBoot(), slimThree()],
  server: { port: 5180 },
  preview: { port: 5181 },
  build: {
    // three.js is a lazy chunk (widgets/scene3d), loaded after the page is interactive
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild
          ? undefined
          : {
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
}));
