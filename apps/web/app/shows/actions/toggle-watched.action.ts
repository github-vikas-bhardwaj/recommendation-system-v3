"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session/get-session";
import { toggleShowWatched } from "@/lib/shows/watched-shows.server";

export type ToggleWatchedActionResult =
  | { ok: true; watched: boolean }
  | { ok: false; error: string };

export async function toggleWatchedAction(showId: number): Promise<ToggleWatchedActionResult> {
  const user = await getSessionUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to mark shows as watched." };
  }

  if (!Number.isInteger(showId) || showId < 1) {
    return { ok: false, error: "Invalid show." };
  }

  const watched = await toggleShowWatched(user.id, showId);
  revalidatePath("/shows");
  revalidatePath("/recommend");

  return { ok: true, watched };
}
