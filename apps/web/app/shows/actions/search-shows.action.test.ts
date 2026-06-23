import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";

const { getSessionUser, getWatchedShowIds, searchShows } = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  getWatchedShowIds: vi.fn(),
  searchShows: vi.fn(),
}));

vi.mock("@/lib/auth/session/get-session", () => ({
  getSessionUser,
}));

vi.mock("@/lib/shows/search-shows", () => ({
  searchShows,
  SHOWS_SEARCH_MIN_LENGTH: 2,
}));

vi.mock("@/lib/shows/watched-shows.server", () => ({
  getWatchedShowIds,
}));

import { searchShowsAction } from "./search-shows.action";

describe("searchShowsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionUser.mockResolvedValue({
      id: USER_ID,
      firstName: "Vikas",
      lastName: null,
      email: "vikas@example.com",
    });
    searchShows.mockResolvedValue([
      {
        id: 1,
        name: "Arrow",
        type: "Scripted",
        status: "Ended",
        imageUrl: "https://static.tvmaze.com/uploads/images/original_untouched/143/358967.jpg",
      },
      { id: 2, name: "Arrested Development", type: "Scripted", status: "Ended", imageUrl: null },
    ]);
    getWatchedShowIds.mockResolvedValue(new Set([1]));
  });

  it("returns an empty list for short queries", async () => {
    const result = await searchShowsAction("a");

    expect(result).toEqual({ ok: true, shows: [], canToggleWatched: true });
    expect(searchShows).not.toHaveBeenCalled();
  });

  it("returns search results with watched state for signed-in users", async () => {
    const result = await searchShowsAction("ar");

    expect(searchShows).toHaveBeenCalledWith("ar");
    expect(getWatchedShowIds).toHaveBeenCalledWith(USER_ID, [1, 2]);
    expect(result).toEqual({
      ok: true,
      canToggleWatched: true,
      shows: [
        {
          id: 1,
          name: "Arrow",
          type: "Scripted",
          status: "Ended",
          imageUrl: "https://static.tvmaze.com/uploads/images/original_untouched/143/358967.jpg",
          isWatched: true,
        },
        {
          id: 2,
          name: "Arrested Development",
          type: "Scripted",
          status: "Ended",
          imageUrl: null,
          isWatched: false,
        },
      ],
    });
  });

  it("returns unwatched results when there is no session", async () => {
    getSessionUser.mockResolvedValue(null);

    const result = await searchShowsAction("ar");

    expect(getWatchedShowIds).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canToggleWatched).toBe(false);
      expect(result.shows.every((show) => show.isWatched === false)).toBe(true);
    }
  });

  it("returns an error when search fails", async () => {
    searchShows.mockRejectedValue(new Error("db down"));

    const result = await searchShowsAction("ar");

    expect(result).toEqual({
      ok: false,
      error: "Could not load search results. Please try again.",
    });
  });
});
