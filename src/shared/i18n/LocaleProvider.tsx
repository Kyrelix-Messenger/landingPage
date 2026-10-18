import type { ReactNode } from "react";
import { LocaleContext } from "./model/localeContext";
import type { LocaleStore } from "./model/localeStore";

export function LocaleProvider({
  store,
  children,
}: {
  store: LocaleStore;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={store}>{children}</LocaleContext.Provider>
  );
}
