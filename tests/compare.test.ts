import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SINGLE_PANE_REST,
  clamp,
  restingAnchor,
  restingPosition,
} from "../src/widgets/appearance/compareMath.ts";

describe("clamp", () => {
  it("keeps a value inside the range", () => {
    assert.equal(clamp(5, 8, 92), 8);
    assert.equal(clamp(99, 8, 92), 92);
    assert.equal(clamp(40, 8, 92), 40);
  });
});

describe("resting anchor", () => {
  // a 800 px frame at x = 100; the chat list takes the left third; panes are 8 px apart
  const frame = { left: 100, width: 800 };

  it("sits in the gap in front of the messages, about a third in", () => {
    const anchor = restingAnchor(frame, { left: 108, right: 380 }, 8, false);
    assert.ok(anchor !== null);
    assert.equal(anchor, ((380 + 4 - 100) / 800) * 100);
    assert.ok(anchor > 30 && anchor < 40);
  });

  it("mirrors in a right-to-left page, where the list is on the right", () => {
    const anchor = restingAnchor(frame, { left: 620, right: 892 }, 8, true);
    assert.ok(anchor !== null);
    assert.equal(anchor, ((620 - 4 - 100) / 800) * 100);
    assert.ok(anchor > 60 && anchor < 70);
  });

  it("is null when the list is hidden (a one-pane window)", () => {
    assert.equal(restingAnchor(frame, { left: 0, right: 0 }, 8, false), null);
    assert.equal(
      restingAnchor({ left: 0, width: 0 }, { left: 1, right: 2 }, 8, false),
      null,
    );
  });

  it("never leaves the frame", () => {
    const far = restingAnchor(frame, { left: 108, right: 2000 }, 8, false);
    assert.equal(far, 92);
  });

  it("falls back to 50/50 on a phone", () => {
    assert.equal(restingPosition(null), SINGLE_PANE_REST);
    assert.equal(restingPosition(35.5), 35.5);
  });
});
