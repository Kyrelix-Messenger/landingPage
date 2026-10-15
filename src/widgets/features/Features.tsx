import { useTranslation } from "@/shared/i18n";
import { Section } from "@/shared/ui/section/Section";
import { Tile } from "./ui/Tile";
import {
  ChannelVisual,
  ChatVisual,
  GroupVisual,
  PeopleVisual,
  SecurityVisual,
} from "./ui/visuals";
import styles from "./Features.module.css";

export function Features() {
  const { t } = useTranslation();
  return (
    <Section
      id="features"
      title={t("features.title")}
      lead={t("features.lead")}
    >
      <div className={styles.grid}>
        <Tile
          area={styles.chats}
          title={t("features.chats.title")}
          text={t("features.chats.text")}
        >
          <ChatVisual />
        </Tile>
        <Tile
          area={styles.groups}
          title={t("features.groups.title")}
          text={t("features.groups.text")}
          delay={0.08}
        >
          <GroupVisual />
        </Tile>
        <Tile
          area={styles.channels}
          title={t("features.channels.title")}
          text={t("features.channels.text")}
          delay={0.16}
        >
          <ChannelVisual />
        </Tile>
        <Tile
          area={styles.people}
          title={t("features.people.title")}
          text={t("features.people.text")}
          delay={0.08}
        >
          <PeopleVisual />
        </Tile>
        <Tile
          wide
          area={styles.security}
          title={t("features.security.title")}
          text={t("features.security.text")}
        >
          <SecurityVisual />
        </Tile>
      </div>
    </Section>
  );
}
