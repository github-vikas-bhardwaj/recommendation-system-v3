import { redirect } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { getSessionUser } from "@/lib/auth/session/get-session";

import { SignupForm } from "./_components/SignupForm";
import { SignupPromoPanel } from "./_components/SignupPromoPanel";

export default async function SignupPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/recommend");
  }

  return <AuthSplitLayout promo={<SignupPromoPanel />} form={<SignupForm />} />;
}
