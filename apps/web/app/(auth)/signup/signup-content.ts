export const signupPromoContent = {
  eyebrow: "Join Recommend",
  title: "Start discovering things you'll actually love",
  description:
    "Create a free account and tell us what you enjoy — we'll handle the rest with smart, tailored suggestions.",
  benefits: [
    "Personalized AI recommendations from day one",
    "Secure sessions with encrypted cookies",
    "Save your taste profile across devices",
  ],
} as const;

export const signupFormContent = {
  title: "Create your account",
  subtitle: "It only takes a minute.",
  submitLabel: "Create account",
  submittingLabel: "Creating account...",
  footerText: "Already have an account?",
  footerLinkLabel: "Sign in",
  footerLinkHref: "/signin",
  passwordHint: "At least 8 characters with uppercase, lowercase, number, and special character.",
} as const;

export const signupFields = {
  firstName: { label: "First name", placeholder: "John", autoComplete: "given-name" },
  lastName: {
    label: "Last name",
    placeholder: "Doe",
    autoComplete: "family-name",
    optional: true,
  },
  email: { label: "Email", placeholder: "johndoe@example.com", autoComplete: "email" },
  password: {
    label: "Password",
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
  confirmPassword: {
    label: "Confirm password",
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
} as const;
