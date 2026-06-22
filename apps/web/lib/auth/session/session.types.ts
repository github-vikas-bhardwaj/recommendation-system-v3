export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string; // plain string — for cookies only, never JSON responses
};

export type IssuedSession = SessionTokens & {
  refreshExpiresAt: Date;
};
