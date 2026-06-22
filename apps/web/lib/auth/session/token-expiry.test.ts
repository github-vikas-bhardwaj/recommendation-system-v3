import { describe, expect, it } from "vitest";

import { parseDurationToSeconds } from "./token-expiry";

describe("parseDurationToSeconds", () => {
  it("parses seconds", () => {
    expect(parseDurationToSeconds("30s")).toBe(30);
  });

  it("parses minutes", () => {
    expect(parseDurationToSeconds("15m")).toBe(900);
  });

  it("parses hours", () => {
    expect(parseDurationToSeconds("2h")).toBe(7_200);
  });

  it("parses days", () => {
    expect(parseDurationToSeconds("7d")).toBe(604_800);
  });

  it("throws for invalid duration", () => {
    expect(() => parseDurationToSeconds("bad")).toThrow("Invalid duration");
  });
});
