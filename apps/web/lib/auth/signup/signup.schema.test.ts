import { describe, expect, it } from "vitest";

import { signupSchema } from "./signup.schema";

const validBody = {
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
  password: "Password123!",
  confirmPassword: "Password123!",
};

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse(validBody);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual({
      firstName: "Vikas",
      lastName: "Bhardwaj",
      email: "vikas@example.com",
      password: "Password123!",
    });
  });

  it("normalizes email and optional lastName", () => {
    const result = signupSchema.safeParse({
      ...validBody,
      email: "  Vikas@Example.COM  ",
      lastName: undefined,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.email).toBe("vikas@example.com");
    expect(result.data.lastName).toBeNull();
  });

  it("rejects weak passwords", () => {
    const result = signupSchema.safeParse({
      ...validBody,
      password: "weak",
      confirmPassword: "weak",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues.some((issue) => issue.path.includes("password"))).toBe(true);
  });

  it("rejects password mismatch", () => {
    const result = signupSchema.safeParse({
      ...validBody,
      confirmPassword: "Password123",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(
      result.error.issues.some(
        (issue) =>
          issue.path.includes("confirmPassword") && issue.message === "Passwords do not match"
      )
    ).toBe(true);
  });
});
