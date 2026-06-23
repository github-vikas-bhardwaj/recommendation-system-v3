import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";

const { getSessionUser, revalidatePath, toggleShowWatched } = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  revalidatePath: vi.fn(),
  toggleShowWatched: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/auth/session/get-session", () => ({
  getSessionUser,
}));

vi.mock("@/lib/shows/watched-shows.server", () => ({
  toggleShowWatched,
}));

import { toggleWatchedAction } from "./toggle-watched.action";

describe("toggleWatchedAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionUser.mockResolvedValue({
      id: USER_ID,
      firstName: "Vikas",
      lastName: null,
      email: "vikas@example.com",
    });
  });

  it("returns unauthorized when there is no session user", async () => {
    getSessionUser.mockResolvedValue(null);

    const result = await toggleWatchedAction(10);

    expect(result).toEqual({
      ok: false,
      error: "You must be signed in to mark shows as watched.",
    });
    expect(toggleShowWatched).not.toHaveBeenCalled();
  });

  it("returns an error for invalid show ids", async () => {
    const result = await toggleWatchedAction(0);

    expect(result).toEqual({ ok: false, error: "Invalid show." });
    expect(toggleShowWatched).not.toHaveBeenCalled();
  });

  it("toggles watched state and revalidates the shows page", async () => {
    toggleShowWatched.mockResolvedValue(true);

    const result = await toggleWatchedAction(10);

    expect(toggleShowWatched).toHaveBeenCalledWith(USER_ID, 10);
    expect(revalidatePath).toHaveBeenCalledWith("/shows");
    expect(revalidatePath).toHaveBeenCalledWith("/recommend");
    expect(result).toEqual({ ok: true, watched: true });
  });
});
