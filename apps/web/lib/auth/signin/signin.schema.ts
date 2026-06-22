import { z } from "zod";

export const signinSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "Invalid email address" })),
    password: z.string().min(1, "Password is required"),
  })
  .transform(({ email, password }) => ({ email, password }));

export type SigninInput = z.infer<typeof signinSchema>;
