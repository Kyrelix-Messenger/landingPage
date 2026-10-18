import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { LOCALES, findLocale } from "@/shared/boot/boot";
import { useLocaleStore, useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon/Icon";
import { LocaleLink } from "@/shared/ui/locale-link/LocaleLink";
import styles from "./LanguageMenu.module.css";

/** Language picker: a pill trigger and a listbox with the same keyboard model as the messenger's. */
export function LanguageMenu() {
  const { t, locale } = useTranslation();
  const setLocale = useLocaleStore((state) => state.setLocale);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = findLocale(locale) ?? LOCALES[1];

  // keyboard focus follows the active option while the list is open
  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.focus({ preventScroll: true });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openList = () => {
    setActive(
      Math.max(
        0,
        LOCALES.findIndex((item) => item.code === locale),
      ),
    );
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  const choose = (index: number) => {
    close(true);
    void setLocale(LOCALES[index].code);
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openList();
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = LOCALES.length - 1;
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close(true);
        break;
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => (index >= last ? 0 : index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => (index <= 0 ? last : index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
    }
  };

  return (
    <div className={styles.menu} ref={container}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("header.language")}
        title={t("header.language")}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <Icon name="globe" size="1.25rem" />
        <span className={styles.current} translate="no" lang={current.html}>
          {current.name}
        </span>
        <Icon name="chevronDown" size="1rem" className={styles.chevron} />
      </button>

      <ul
        ref={list}
        id={listId}
        role="listbox"
        aria-label={t("header.language")}
        className={cn(styles.list, open && styles.open)}
        inert={!open}
        onKeyDown={onListKeyDown}
      >
        {LOCALES.map((item, index) => (
          <li key={item.code} role="presentation">
            <LocaleLink
              locale={item.code}
              role="option"
              aria-selected={item.code === locale}
              data-index={index}
              tabIndex={open && index === active ? 0 : -1}
              className={styles.option}
              lang={item.html}
              translate="no"
              onClick={() => close(true)}
            >
              <span>{item.name}</span>
              <Icon
                name="check"
                size="1rem"
                strokeWidth={2.5}
                className={styles.check}
              />
            </LocaleLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
