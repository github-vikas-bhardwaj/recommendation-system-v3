export type SigninActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string[]>>;
};

export const initialSigninActionState: SigninActionState = {};
