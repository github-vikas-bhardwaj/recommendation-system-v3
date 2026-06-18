import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session/get-session";

import { RecommendPanel } from "./_components/RecommendPanel";

export default async function RecommendPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signup");
  }

  return <RecommendPanel firstName={user.firstName} />;
}
