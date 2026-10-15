import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { TranslationKey } from "@/shared/i18n";
import {
  CHATS,
  REPLIES,
  chatById,
  type ChatId,
  type Person,
  type Section,
} from "./demoData";
import { INTRO, READ_DELAY, REPLY_AT, type IntroStep } from "./pacing";

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  sender?: Person;
  text: { key: TranslationKey } | { raw: string };
  at: Date;
  /** Newly arrived: plays the messenger's entrance animation. */
  fresh: boolean;
}

interface State {
  messages: Record<ChatId, ChatMessage[]>;
  unread: Record<ChatId, number>;
  typing: ChatId | null;
  nextId: number;
  replyIndex: number;
}

type Action =
  | { type: "reveal"; chat: ChatId; count: number; fresh: boolean }
  | { type: "typing"; chat: ChatId | null }
  | { type: "send"; chat: ChatId; text: string }
  | { type: "reply"; chat: ChatId; unread: boolean }
  | { type: "read"; chat: ChatId };

function today(hours: number, minutes: number): Date {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function seedMessages(
  chat: ChatId,
  count: number,
  fresh: boolean,
): ChatMessage[] {
  return chatById(chat)
    .seed.slice(0, count)
    .map((seed) => ({
      id: seed.id,
      from: seed.from,
      sender: seed.sender,
      text: { key: seed.text },
      at: today(seed.at[0], seed.at[1]),
      fresh,
    }));
}

function initialState(autoplay: boolean): State {
  const messages = {} as Record<ChatId, ChatMessage[]>;
  const unread = {} as Record<ChatId, number>;
  for (const chat of CHATS) {
    // the first chat types itself out on load; everything else is already there
    messages[chat.id] = seedMessages(
      chat.id,
      chat.id === "mia" && autoplay ? 0 : chat.seed.length,
      false,
    );
    unread[chat.id] = chat.unread;
  }
  return { messages, unread, typing: null, nextId: 1, replyIndex: 0 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reveal": {
      if (state.messages[action.chat].length >= action.count) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chat]: seedMessages(action.chat, action.count, action.fresh),
        },
      };
    }
    case "typing":
      return state.typing === action.chat
        ? state
        : { ...state, typing: action.chat };
    case "send": {
      const message: ChatMessage = {
        id: `me-${state.nextId}`,
        from: "me",
        text: { raw: action.text },
        at: new Date(),
        fresh: true,
      };
      return {
        ...state,
        nextId: state.nextId + 1,
        messages: {
          ...state.messages,
          [action.chat]: [...state.messages[action.chat], message],
        },
      };
    }
    case "reply": {
      const chat = chatById(action.chat);
      const message: ChatMessage = {
        id: `them-${state.nextId}`,
        from: "them",
        sender:
          chat.kind === "group"
            ? state.replyIndex % 2 === 0
              ? "alex"
              : "mia"
            : undefined,
        text: { key: REPLIES[state.replyIndex % REPLIES.length] },
        at: new Date(),
        fresh: true,
      };
      return {
        ...state,
        nextId: state.nextId + 1,
        replyIndex: state.replyIndex + 1,
        typing: state.typing === action.chat ? null : state.typing,
        messages: {
          ...state.messages,
          [action.chat]: [...state.messages[action.chat], message],
        },
        unread: action.unread
          ? { ...state.unread, [action.chat]: state.unread[action.chat] + 1 }
          : state.unread,
      };
    }
    case "read":
      return state.unread[action.chat] === 0
        ? state
        : { ...state, unread: { ...state.unread, [action.chat]: 0 } };
  }
}

function introAction(step: IntroStep): Action {
  if (step.kind === "message")
    return { type: "reveal", chat: "mia", count: step.count ?? 0, fresh: true };
  return { type: "typing", chat: step.kind === "typing-on" ? "mia" : null };
}

/** All state of the interactive preview: chats, the auto-replies and the intro. */
export function useDemoChat(autoplay: boolean) {
  const [state, dispatch] = useReducer(reducer, autoplay, initialState);
  const [section, setSection] = useState<Section>("chats");
  const [activeId, setActiveId] = useState<ChatId>("mia");
  const [pane, setPane] = useState<"list" | "chat">("chat");
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<"end" | "start">("end");
  const introTimers = useRef<number[]>([]);
  const replyTimers = useRef<number[]>([]);
  const activeRef = useRef<ChatId>(activeId);

  // the opening conversation plays once; any interaction finishes it immediately
  useEffect(() => {
    if (!autoplay) return;
    const ids = introTimers.current;
    for (const step of INTRO)
      ids.push(window.setTimeout(() => dispatch(introAction(step)), step.at));
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      ids.length = 0;
    };
  }, [autoplay]);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const ids = replyTimers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const finishIntro = useCallback(() => {
    introTimers.current.forEach((id) => window.clearTimeout(id));
    introTimers.current.length = 0;
    dispatch({ type: "typing", chat: null });
    dispatch({
      type: "reveal",
      chat: "mia",
      count: chatById("mia").seed.length,
      fresh: false,
    });
  }, []);

  const openChat = useCallback(
    (id: ChatId) => {
      finishIntro();
      setActiveId(id);
      setPane("chat");
      dispatch({ type: "read", chat: id });
    },
    [finishIntro],
  );

  const openSection = useCallback(
    (next: Section) => {
      finishIntro();
      setSection(next);
      setQuery("");
      if (next === "calls") return;
      const first = CHATS.find((chat) => chat.section === next);
      if (!first) return;
      setActiveId(first.id);
      setPane("list");
      dispatch({ type: "read", chat: first.id });
    },
    [finishIntro],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      const chat = chatById(activeId);
      if (!text || chat.kind === "channel") return;
      finishIntro();
      dispatch({ type: "send", chat: activeId, text });
      const target = activeId;
      replyTimers.current.push(
        window.setTimeout(
          () => dispatch({ type: "typing", chat: target }),
          READ_DELAY,
        ),
      );
      replyTimers.current.push(
        window.setTimeout(
          () =>
            dispatch({
              type: "reply",
              chat: target,
              unread: activeRef.current !== target,
            }),
          REPLY_AT,
        ),
      );
    },
    [activeId, finishIntro],
  );

  const swapSide = useCallback(
    () => setSide((current) => (current === "end" ? "start" : "end")),
    [],
  );

  return {
    state,
    section,
    activeId,
    pane,
    query,
    side,
    setPane,
    setQuery,
    openChat,
    openSection,
    send,
    swapSide,
  };
}
