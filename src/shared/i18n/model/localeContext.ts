import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { LocaleStore } from "./localeStore";

export const LocaleContext = createContext<LocaleStore | null>(null);

export function useLocaleStore<T>(
  selector: (state: ReturnType<LocaleStore["getState"]>) => T,
): T {
  const store = useContext(LocaleContext);
  if (!store) throw new Error("LocaleProvider is missing");
  return useStore(store, selector);
}
