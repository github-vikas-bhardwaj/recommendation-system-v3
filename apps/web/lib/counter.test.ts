import { describe, expect, it } from "vitest";

import { incrementCounter } from "./counter";

describe("incrementCounter", () => {
  it("increments by 1 by default", () => {
    expect(incrementCounter(0)).toBe(1);
    expect(incrementCounter(5)).toBe(6);
  });

  it("increments by a custom step", () => {
    expect(incrementCounter(10, 5)).toBe(15);
  });

  it("throws for invalid input", () => {
    expect(() => incrementCounter(NaN)).toThrow("finite number");
  });
});
