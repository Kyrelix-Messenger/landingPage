import { useId, useState } from "react";
import { useTranslation, type TranslationKey } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon/Icon";
import { Reveal } from "@/shared/ui/reveal/Reveal";
import { Section } from "@/shared/ui/section/Section";
import styles from "./Faq.module.css";

const QUESTIONS: ReadonlyArray<{ q: TranslationKey; a: TranslationKey }> = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
];

export function Faq() {
  const { t } = useTranslation();
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  return (
    <Section id="faq" split title={t("faq.title")}>
      <Reveal>
        <div className={styles.list}>
          {QUESTIONS.map((item, index) => {
            const expanded = open.has(index);
            const questionId = `${baseId}-q${index}`;
            const answerId = `${baseId}-a${index}`;
            return (
              <div
                key={item.q}
                className={cn(styles.item, expanded && styles.open)}
              >
                <h3 className={styles.question}>
                  <button
                    id={questionId}
                    type="button"
                    className={styles.trigger}
                    aria-expanded={expanded}
                    aria-controls={answerId}
                    onClick={() => toggle(index)}
                  >
                    <span>{t(item.q)}</span>
                    <Icon
                      name="chevronDown"
                      size="1.375rem"
                      className={styles.chevron}
                    />
                  </button>
                </h3>
                {/* grid-template-rows 0fr → 1fr animates the height without measuring anything */}
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className={styles.answer}
                >
                  <div className={styles.answerInner}>
                    <p>{t(item.a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}
