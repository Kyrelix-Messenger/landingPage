import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INTRO,
  READ_DELAY,
  REPLY_AT,
  REPLY_TYPING_AT,
  typingDuration,
} from "../src/widgets/app-preview/model/pacing.ts";

describe("typing duration", () => {
  it("is never instant and never endless", () => {
    assert.equal(typingDuration(0), 1600);
    assert.equal(typingDuration(14), 1670);
    assert.equal(typingDuration(500), 3600);
  });

  it("grows with the length of the message", () => {
    assert.ok(typingDuration(60) > typingDuration(30));
  });
});

describe("auto-reply", () => {
  it("is read first, then typed: nothing arrives within a second or two", () => {
    assert.equal(REPLY_TYPING_AT, READ_DELAY);
    assert.ok(REPLY_TYPING_AT >= 1000);
    assert.ok(REPLY_AT - REPLY_TYPING_AT >= 1600);
  });
});

describe("opening conversation", () => {
  const messages = INTRO.filter((step) => step.kind === "message");

  it("is in time order and reveals one message at a time", () => {
    const times = INTRO.map((step) => step.at);
    assert.deepEqual(
      times,
      [...times].sort((a, b) => a - b),
    );
    assert.deepEqual(
      messages.map((step) => step.count),
      [1, 2, 3, 4],
    );
  });

  it("looks human: a pause before the first message and time to read between them", () => {
    assert.ok(messages[0].at >= 2500);
    for (let i = 1; i < messages.length; i++) {
      assert.ok(
        messages[i].at - messages[i - 1].at >= 1500,
        `messages ${i} and ${i + 1} are too close`,
      );
    }
  });

  it("shows the typing indicator before every message from Mia", () => {
    const on = INTRO.filter((step) => step.kind === "typing-on");
    const off = INTRO.filter((step) => step.kind === "typing-off");
    assert.equal(on.length, 2);
    assert.equal(off.length, 2);
    for (let i = 0; i < on.length; i++) {
      assert.ok(off[i].at - on[i].at >= 1600, "typing lasts a while");
    }
    // each typing-off lands together with the message it announced
    for (const step of off) {
      assert.ok(messages.some((message) => message.at === step.at));
    }
  });

  it("takes about ten to fifteen seconds", () => {
    const end = Math.max(...INTRO.map((step) => step.at));
    assert.ok(end >= 10000 && end <= 15000, `ends at ${end} ms`);
  });
});
