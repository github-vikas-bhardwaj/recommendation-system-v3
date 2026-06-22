export const signinPromoContent = {
  eyebrow: "Welcome back",
  title: "Pick up right where you left off",
  description:
    "Sign in to access your personalized recommendations and continue exploring things matched to your taste.",
  benefits: [
    "Your saved taste profile, ready instantly",
    "Secure httpOnly session cookies",
    "Fresh AI picks every time you visit",
  ],
} as const;

export const signinFormContent = {
  title: "Sign in to your account",
  subtitle: "Enter your email and password to continue.",
  submitLabel: "Sign in",
  submittingLabel: "Signing in...",
  footerText: "Don't have an account?",
  footerLinkLabel: "Sign up",
  footerLinkHref: "/signup",
} as const;

export const signinFields = {
  email: { label: "Email", placeholder: "johndoe@example.com", autoComplete: "email" },
  password: {
    label: "Password",
    placeholder: "••••••••",
    autoComplete: "current-password",
  },
} as const;
