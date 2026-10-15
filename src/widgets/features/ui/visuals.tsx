import { useFormatTime, useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Bubble } from "@/shared/ui/bubble/Bubble";
import { Icon, type IconName } from "@/shared/ui/icon/Icon";
import styles from "../Features.module.css";

/** A fixed time of day, formatted in the visitor's language. */
function clock(hours: number, minutes: number): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Personal chat: header, a few messages, the composer. */
export function ChatVisual() {
  const { t } = useTranslation();
  const format = useFormatTime();
  return (
    <div className={cn(styles.frame, styles.chatFrame)}>
      <div className={styles.frameHead}>
        <Avatar name={t("chat.mia")} size="2.5rem" />
        <div className={styles.frameWho}>
          <strong>{t("chat.mia")}</strong>
          <span className={styles.frameStatus}>
            <i className={styles.dot} />
            {t("demo.online")}
          </span>
        </div>
      </div>
      <div className={styles.chatBody}>
        <div className={styles.row}>
          <Bubble time={format(clock(12, 40))}>{t("chat.mia.1")}</Bubble>
        </div>
        <div className={cn(styles.row, styles.rowOwn)}>
          <Bubble own time={format(clock(12, 41))}>
            {t("chat.mia.2")}
          </Bubble>
        </div>
        <div className={styles.row}>
          <Bubble time={format(clock(12, 42))}>{t("chat.mia.3")}</Bubble>
        </div>
        <div className={cn(styles.row, styles.rowOwn)}>
          <Bubble own time={format(clock(12, 42))}>
            {t("chat.mia.4")}
          </Bubble>
        </div>
      </div>
      <div className={styles.compose}>
        <span className={styles.composeInput}>{t("demo.input")}</span>
        <span className={styles.composeSend}>
          <Icon name="send" size="1.25rem" className={styles.flip} />
        </span>
      </div>
    </div>
  );
}

/** A new group: its name, the chosen members and the resulting chat in the list. */
export function GroupVisual() {
  const { t } = useTranslation();
  return (
    <div className={cn(styles.frame, styles.stack)}>
      <div className={styles.groupName}>
        <Avatar name={t("chat.team")} tone={2} size="3rem" />
        <span className={styles.groupField}>{t("chat.team")}</span>
      </div>
      <div className={styles.chips}>
        <span className={cn(styles.chip, styles.chipOn)}>
          <Avatar name={t("chat.mia")} size="1.5rem" />
          {t("chat.mia")}
          <Icon name="check" size="1rem" strokeWidth={2.5} />
        </span>
        <span className={cn(styles.chip, styles.chipOn)}>
          <Avatar name={t("chat.alex")} tone={1} size="1.5rem" />
          {t("chat.alex")}
          <Icon name="check" size="1rem" strokeWidth={2.5} />
        </span>
        <span className={styles.chip}>+3</span>
      </div>
      <div className={styles.listRow}>
        <Avatar name={t("chat.team")} tone={2} size="2.75rem" />
        <span className={styles.listText}>
          <strong>{t("chat.team")}</strong>
          <span>
            {t("chat.alex")}: {t("chat.team.1")}
          </span>
        </span>
        <span className={styles.badge}>2</span>
      </div>
    </div>
  );
}

/** A channel: posts from the owner, and the read-only bar every subscriber sees. */
export function ChannelVisual() {
  const { t } = useTranslation();
  const format = useFormatTime();
  return (
    <div className={cn(styles.frame, styles.stack)}>
      <div className={styles.frameHead}>
        <Avatar name={t("chat.news")} tone={1} size="2.5rem" />
        <div className={styles.frameWho}>
          <strong>{t("chat.news")}</strong>
          <span className={styles.frameStatus}>{t("demo.channel")}</span>
        </div>
      </div>
      <div className={styles.posts}>
        <Bubble time={format(clock(11, 30))}>{t("chat.news.1")}</Bubble>
        <Bubble time={format(clock(11, 32))}>{t("chat.news.2")}</Bubble>
      </div>
      <p className={styles.readOnly}>
        <Icon name="lock" size="1rem" />
        {t("demo.readOnly")}
      </p>
    </div>
  );
}

/** People search and a profile card. */
export function PeopleVisual() {
  const { t } = useTranslation();
  return (
    <div className={cn(styles.frame, styles.peopleFrame)}>
      <div className={styles.stack}>
        <div className={styles.field}>
          <Icon name="search" size="1.125rem" />
          <span>mi</span>
          <i className={styles.caret} />
        </div>
        <div className={cn(styles.result, styles.resultOn)}>
          <Avatar name={t("chat.mia")} size="2.5rem" />
          <span className={styles.resultText}>
            <strong>{t("chat.mia")}</strong>
            <span>@mia</span>
          </span>
        </div>
        <div className={styles.result}>
          <Avatar name="Mila" tone={1} size="2.5rem" />
          <span className={styles.resultText}>
            <strong>Mila K.</strong>
            <span>@mila</span>
          </span>
        </div>
        <div className={styles.result}>
          <Avatar name="Mike" tone={2} size="2.5rem" />
          <span className={styles.resultText}>
            <strong>Mike S.</strong>
            <span>@mike</span>
          </span>
        </div>
      </div>
      <div className={styles.profile}>
        <Avatar name={t("chat.mia")} size="4.5rem" />
        <strong className={styles.profileName}>{t("chat.mia")}</strong>
        <span className={styles.handle}>@mia</span>
        <p className={styles.bio}>{t("features.people.bio")}</p>
      </div>
    </div>
  );
}

const FACTS: ReadonlyArray<{
  icon: IconName;
  key:
    | "features.security.1"
    | "features.security.2"
    | "features.security.3"
    | "features.security.4";
}> = [
  { icon: "mail", key: "features.security.1" },
  { icon: "key", key: "features.security.2" },
  { icon: "reset", key: "features.security.3" },
  { icon: "shield", key: "features.security.4" },
];

/** The four facts about signing in. */
export function SecurityVisual() {
  const { t } = useTranslation();
  return (
    <ul className={styles.facts}>
      {FACTS.map((fact) => (
        <li key={fact.key} className={styles.fact}>
          <span className={styles.factIcon}>
            <Icon name={fact.icon} size="1.5rem" strokeWidth={1.5} />
          </span>
          {t(fact.key)}
        </li>
      ))}
    </ul>
  );
}
