import { redirect } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { getSessionUser } from "@/lib/auth/session/get-session";

import { SigninForm } from "./_components/SigninForm";
import { SigninPromoPanel } from "./_components/SigninPromoPanel";

export default async function SigninPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/shows");
  }

  return <AuthSplitLayout promo={<SigninPromoPanel />} form={<SigninForm />} />;
}
