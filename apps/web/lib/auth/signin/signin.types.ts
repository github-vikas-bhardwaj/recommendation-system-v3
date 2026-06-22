export type SigninResponse = {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
};
