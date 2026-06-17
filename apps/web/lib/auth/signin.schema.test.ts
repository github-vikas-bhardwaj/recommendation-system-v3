import { describe, expect, it } from "vitest";
import { signinSchema } from "./signin.schema";

const validBody = {
  email: "vikas@example.com",
  password: "Password123!",
};

describe("signinSchema", () => {
  it("accepts valid signin data", () => {
    const result = signinSchema.safeParse(validBody);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual({
      email: "vikas@example.com",
      password: "Password123!",
    });
  });

  it("normalizes email", () => {
    const result = signinSchema.safeParse({
      ...validBody,
      email: "  Vikas@Example.COM  ",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.email).toBe("vikas@example.com");
  });

  it("rejects invalid email", () => {
    const result = signinSchema.safeParse({
      ...validBody,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = signinSchema.safeParse({
      ...validBody,
      password: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues.some((issue) => issue.path.includes("password"))).toBe(true);
  });
});
