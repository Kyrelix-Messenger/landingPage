import { create } from "zustand";
import {
  DEFAULT_LOCALE,
  STORAGE_KEYS,
  allowsMachineTranslation,
  applyLocaleAttributes,
  writeStored,
  type BootState,
  type LocaleCode,
  type LocaleSource,
} from "@/shared/boot/boot";
import { en, type Dictionary } from "../dictionaries/en";
import { loadDictionary } from "../loadDictionary";

/** How long the old content fades out before the new dictionary is put in. */
const FADE_OUT_MS = 160;

interface LocaleState {
  locale: LocaleCode;
  dict: Dictionary;
  source: LocaleSource;
  userSupported: boolean;
  /** English is shown because the visitor's own language is not supported. */
  allowMachineTranslation: boolean;
  /** True while the page fades out, swaps the dictionary and fades back in. */
  switching: boolean;
  setLocale: (code: LocaleCode) => Promise<void>;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: DEFAULT_LOCALE,
  dict: en,
  source: "default",
  userSupported: false,
  allowMachineTranslation: true,
  switching: false,

  setLocale: async (code) => {
    const { locale, switching, userSupported } = get();
    if (code === locale || switching) return;
    set({ switching: true });
    try {
      const [dict] = await Promise.all([
        loadDictionary(code),
        wait(FADE_OUT_MS),
      ]);
      const allow = allowsMachineTranslation(code, userSupported);
      writeStored(STORAGE_KEYS.locale, code);
      applyLocaleAttributes(code, allow);
      set({
        locale: code,
        dict,
        source: "saved",
        allowMachineTranslation: allow,
      });
    } catch {
      /* the dictionary could not be loaded: stay in the current language */
    } finally {
      set({ switching: false });
    }
  },
}));

/** Called once from main.tsx with the state the inline boot script computed. */
export async function initLocale(boot: BootState): Promise<void> {
  try {
    const dict = await loadDictionary(boot.locale);
    useLocaleStore.setState({
      locale: boot.locale,
      dict,
      source: boot.source,
      userSupported: boot.userSupported,
      allowMachineTranslation: boot.allowMachineTranslation,
    });
  } catch {
    // dictionary unavailable: show English and keep machine translation possible
    applyLocaleAttributes(DEFAULT_LOCALE, true);
    useLocaleStore.setState({
      locale: DEFAULT_LOCALE,
      dict: en,
      source: "default",
      userSupported: boot.userSupported,
      allowMachineTranslation: true,
    });
  }
}
