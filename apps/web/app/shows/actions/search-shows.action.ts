"use server";

import { getSessionUser } from "@/lib/auth/session/get-session";
import { searchShows, SHOWS_SEARCH_MIN_LENGTH } from "@/lib/shows/search-shows";
import type { ShowSearchResultWithWatched } from "@/lib/shows/show.types";
import { getWatchedShowIds } from "@/lib/shows/watched-shows.server";

export type SearchShowsActionResult =
  | { ok: true; shows: ShowSearchResultWithWatched[]; canToggleWatched: boolean }
  | { ok: false; error: string };

export async function searchShowsAction(query: string): Promise<SearchShowsActionResult> {
  const trimmedQuery = query.trim();
  const user = await getSessionUser();

  if (trimmedQuery.length < SHOWS_SEARCH_MIN_LENGTH) {
    return { ok: true, shows: [], canToggleWatched: Boolean(user) };
  }

  try {
    const shows = await searchShows(trimmedQuery);
    const watchedShowIds = user
      ? await getWatchedShowIds(
          user.id,
          shows.map((show) => show.id)
        )
      : new Set<number>();

    return {
      ok: true,
      canToggleWatched: Boolean(user),
      shows: shows.map((show) => ({
        ...show,
        isWatched: watchedShowIds.has(show.id),
      })),
    };
  } catch (error) {
    console.error("[searchShowsAction]", error);
    return { ok: false, error: "Could not load search results. Please try again." };
  }
}
