import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@/app/styles/index.css";
import { App } from "@/app/App";
import {
  bootstrap,
  DEFAULT_LOCALE,
  findLocale,
  pathLocale,
} from "@/shared/boot/boot";
import { initLocale, LocaleProvider } from "@/shared/i18n";
import { languageUrl } from "@/shared/seo/localeUrls";
import { initTheme } from "@/shared/theme";

async function start(): Promise<void> {
  // the inline <head> script has normally run already; this is only a safety net
  if (!window.__KYRELIX_BOOT__) bootstrap();
  const boot = window.__KYRELIX_BOOT__;
  if (!boot) return;

  initTheme(boot);
  const pageLocale =
    findLocale(document.documentElement.dataset.locale)?.code ??
    pathLocale(window.location.pathname) ??
    DEFAULT_LOCALE;
  const store = await initLocale(boot, pageLocale);

  // Preserve old ?lang links while keeping one shareable path for every language.
  const activeLocale = store.getState().locale;
  const url = languageUrl(window.location.href, activeLocale, pageLocale);
  if (url.href !== window.location.href)
    window.history.replaceState(null, "", url);
  window.addEventListener("popstate", () => {
    const locale = pathLocale(window.location.pathname) ?? DEFAULT_LOCALE;
    void store.getState().setLocale(locale, false);
  });

  const root = document.getElementById("root");
  if (!root) return;
  const app = (
    <StrictMode>
      <LocaleProvider store={store}>
        <App />
      </LocaleProvider>
    </StrictMode>
  );
  if (root.dataset.prerendered === "true") hydrateRoot(root, app);
  else createRoot(root).render(app);
}

void start();
