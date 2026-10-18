import { createStore } from "zustand/vanilla";
import {
  STORAGE_KEYS,
  allowsMachineTranslation,
  applyLocaleAttributes,
  writeStored,
  type BootState,
  type LocaleCode,
  type LocaleSource,
} from "@/shared/boot/boot";
import { languageUrl } from "@/shared/seo/localeUrls";
import { type Dictionary } from "../dictionaries/en";
import { loadDictionary } from "../loadDictionary";

const FADE_OUT_MS = 160;

interface LocaleState {
  locale: LocaleCode;
  dict: Dictionary;
  source: LocaleSource;
  userSupported: boolean;
  allowMachineTranslation: boolean;
  switching: boolean;
  setLocale: (code: LocaleCode, updateHistory?: boolean) => Promise<void>;
}

/** A separate store per static render; getInitialState also seeds client hydration. */
export function createLocaleStore(locale: LocaleCode, dict: Dictionary) {
  let request = 0;
  return createStore<LocaleState>((set, get) => ({
    locale,
    dict,
    source: "url",
    userSupported: true,
    allowMachineTranslation: false,
    switching: false,

    setLocale: async (code, updateHistory = true) => {
      const currentRequest = ++request;
      const current = get();
      if (code === current.locale) {
        set({ switching: false });
        return;
      }
      set({ switching: true });
      try {
        const [dictionary] = await Promise.all([
          loadDictionary(code),
          new Promise<void>((resolve) =>
            window.setTimeout(resolve, FADE_OUT_MS),
          ),
        ]);
        if (currentRequest !== request) return;
        const allow = allowsMachineTranslation(code, get().userSupported);
        if (updateHistory) {
          const url = languageUrl(window.location.href, code, current.locale);
          window.history.pushState(null, "", url);
        }
        writeStored(STORAGE_KEYS.locale, code);
        applyLocaleAttributes(code, allow);
        set({
          locale: code,
          dict: dictionary,
          source: "saved",
          allowMachineTranslation: allow,
        });
      } catch {
        // A normal link still reaches the static translation if its dictionary chunk is unavailable.
        if (updateHistory && currentRequest === request)
          window.location.assign(
            languageUrl(window.location.href, code, current.locale),
          );
      } finally {
        if (currentRequest === request) set({ switching: false });
      }
    },
  }));
}

export type LocaleStore = ReturnType<typeof createLocaleStore>;

export async function initLocale(
  boot: BootState,
  pageLocale: LocaleCode,
): Promise<LocaleStore> {
  const dictionary = await loadDictionary(pageLocale);
  const store = createLocaleStore(pageLocale, dictionary);
  try {
    store.setState({
      locale: boot.locale,
      dict: await loadDictionary(boot.locale),
      source: boot.source,
      userSupported: boot.userSupported,
      allowMachineTranslation: boot.allowMachineTranslation,
    });
  } catch {
    // The complete static page remains usable even if another translation fails to download.
    applyLocaleAttributes(pageLocale, true);
    store.setState({ allowMachineTranslation: true });
  }
  return store;
}
