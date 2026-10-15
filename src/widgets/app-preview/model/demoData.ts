import type { TranslationKey } from "@/shared/i18n";

export type ChatId = "mia" | "alex" | "team" | "news";
export type ChatKind = "direct" | "group" | "channel";
/** The messenger's rail sections; "calls" is a placeholder page there too. */
export type Section = "chats" | "groups" | "calls";
export type Person = "mia" | "alex";

export interface SeedMessage {
  id: string;
  from: "me" | "them";
  /** Shown above incoming messages in groups. */
  sender?: Person;
  text: TranslationKey;
  /** Local time of day, hours and minutes. */
  at: readonly [number, number];
}

export interface ChatDefinition {
  id: ChatId;
  kind: ChatKind;
  section: Exclude<Section, "calls">;
  name: TranslationKey;
  tone: 0 | 1 | 2;
  unread: number;
  seed: readonly SeedMessage[];
}

export const PERSON_NAME: Record<Person, TranslationKey> = {
  mia: "chat.mia",
  alex: "chat.alex",
};

export const REPLIES: readonly TranslationKey[] = [
  "demo.reply1",
  "demo.reply2",
  "demo.reply3",
];

export const CHATS: readonly ChatDefinition[] = [
  {
    id: "mia",
    kind: "direct",
    section: "chats",
    name: "chat.mia",
    tone: 0,
    unread: 0,
    seed: [
      { id: "mia-1", from: "them", text: "chat.mia.1", at: [12, 40] },
      { id: "mia-2", from: "me", text: "chat.mia.2", at: [12, 41] },
      { id: "mia-3", from: "them", text: "chat.mia.3", at: [12, 42] },
      { id: "mia-4", from: "me", text: "chat.mia.4", at: [12, 42] },
    ],
  },
  {
    id: "alex",
    kind: "direct",
    section: "chats",
    name: "chat.alex",
    tone: 1,
    unread: 0,
    seed: [
      { id: "alex-1", from: "them", text: "chat.alex.1", at: [9, 14] },
      { id: "alex-2", from: "me", text: "chat.alex.2", at: [9, 15] },
    ],
  },
  {
    id: "team",
    kind: "group",
    section: "groups",
    name: "chat.team",
    tone: 2,
    unread: 2,
    seed: [
      {
        id: "team-1",
        from: "them",
        sender: "alex",
        text: "chat.team.1",
        at: [12, 41],
      },
      {
        id: "team-2",
        from: "them",
        sender: "mia",
        text: "chat.team.2",
        at: [12, 41],
      },
    ],
  },
  {
    id: "news",
    kind: "channel",
    section: "groups",
    name: "chat.news",
    tone: 1,
    unread: 0,
    seed: [
      { id: "news-1", from: "them", text: "chat.news.1", at: [11, 30] },
      { id: "news-2", from: "them", text: "chat.news.2", at: [11, 32] },
    ],
  },
];

export function chatById(id: ChatId): ChatDefinition {
  return CHATS.find((chat) => chat.id === id) ?? CHATS[0];
}
