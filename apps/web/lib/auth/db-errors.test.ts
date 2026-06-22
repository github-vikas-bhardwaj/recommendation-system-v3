import { describe, expect, it } from "vitest";

import { isUniqueViolation, UNIQUE_VIOLATION_CODE } from "./db-errors";

describe("isUniqueViolation", () => {
  it("returns true for postgres unique violation on error.code", () => {
    expect(isUniqueViolation({ code: UNIQUE_VIOLATION_CODE })).toBe(true);
  });

  it("returns true for unique violation on nested cause.code", () => {
    expect(isUniqueViolation({ cause: { code: UNIQUE_VIOLATION_CODE } })).toBe(true);
  });

  it("returns false for other postgres errors", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
  });
});
