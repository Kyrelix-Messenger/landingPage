import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/styles/index.css";
import { App } from "@/app/App";
import { bootstrap } from "@/shared/boot/boot";
import { initLocale } from "@/shared/i18n";
import { initTheme } from "@/shared/theme";

async function start(): Promise<void> {
  // the inline <head> script has normally run already; this is only a safety net
  if (!window.__KYRELIX_BOOT__) bootstrap();
  const boot = window.__KYRELIX_BOOT__;
  if (!boot) return;

  initTheme(boot);
  // the dictionary is loaded before the first render, so the page never flashes English first
  await initLocale(boot);

  const root = document.getElementById("root");
  if (!root) return;
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
