import { renderToString } from "react-dom/server";
import { App } from "@/app/App";
import type { LocaleCode } from "@/shared/boot/boot";
import { createLocaleStore, LocaleProvider } from "@/shared/i18n";
import { loadDictionary } from "@/shared/i18n/loadDictionary";

/** Build-time rendering only. Hosting still needs nothing beyond ordinary static files. */
export async function renderPage(locale: LocaleCode): Promise<string> {
  const store = createLocaleStore(locale, await loadDictionary(locale));
  return renderToString(
    <LocaleProvider store={store}>
      <App />
    </LocaleProvider>,
  );
}
