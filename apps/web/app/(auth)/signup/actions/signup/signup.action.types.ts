export type SignupActionState = {
  error?: string;
  fieldErrors?: Partial<
    Record<"firstName" | "lastName" | "email" | "password" | "confirmPassword", string[]>
  >;
};

export const initialSignupActionState: SignupActionState = {};
