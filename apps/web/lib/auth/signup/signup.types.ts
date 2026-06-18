/** Success response from signup — never include password */
export type SignupResponse = {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
};
