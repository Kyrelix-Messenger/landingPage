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

/** Do not let shared dependencies of a manually named chunk pull WebGL into the entry graph. */
function checkLazyScene(): Plugin {
  let ssr = false;
  return {
    name: "kyrelix:check-lazy-scene",
    apply: "build",
    configResolved(config) {
      ssr = !!config.build.ssr;
    },
    generateBundle(_options, bundle) {
      if (ssr) return;
      const visited = new Set<string>();
      const check = (fileName: string): void => {
        if (visited.has(fileName)) return;
        visited.add(fileName);
        const chunk = bundle[fileName];
        if (!chunk || chunk.type !== "chunk") return;
        for (const moduleId of chunk.moduleIds) {
          if (
            /\/node_modules\/(?:three\/|@react-three\/fiber\/|react-reconciler\/)/.test(
              moduleId.replace(/\\/g, "/"),
            )
          )
            this.error(
              `A 3D dependency was included in the initial page bundle: ${moduleId}`,
            );
        }
        chunk.imports.forEach(check);
      };
      for (const chunk of Object.values(bundle))
        if (chunk.type === "chunk" && chunk.isEntry) check(chunk.fileName);
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
  plugins: [react(), inlineBoot(), slimThree(), checkLazyScene()],
  server: { port: 5180 },
  preview: { port: 5181 },
  build: {
    // three.js is a lazy chunk (widgets/scene3d), loaded after the page is interactive
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // The object form used to capture shared scheduler code inside vendor-r3f,
        // making React DOM import the entire 3D renderer even on phones.
        onlyExplicitManualChunks: true,
        manualChunks: isSsrBuild
          ? undefined
          : (id) => {
              const moduleId = id.replace(/\\/g, "/");
              if (
                /\/node_modules\/(?:react|react-dom|scheduler)\//.test(moduleId)
              )
                return "vendor-react";
              if (
                /\/node_modules\/(?:framer-motion|motion-dom|motion-utils)\//.test(
                  moduleId,
                )
              )
                return "vendor-ui";
              // Let Rollup keep three.js, R3F and their private dependencies behind import("./Scene").
              return undefined;
            },
      },
    },
  },
}));
