import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";
const SHOW_ID = 42;

const { deleteWhere, insertValues, select, insert, deleteDb } = vi.hoisted(() => ({
  deleteWhere: vi.fn(),
  insertValues: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  deleteDb: vi.fn(),
}));

function mockWhereResult(rows: unknown[]) {
  return {
    limit: vi.fn().mockResolvedValue(rows),
    then(resolve: (value: unknown[]) => void) {
      resolve(rows);
    },
  };
}

select.mockImplementation(() => ({
  from: () => ({
    where: () => mockWhereResult([]),
  }),
}));

deleteWhere.mockResolvedValue(undefined);
deleteDb.mockImplementation(() => ({ where: deleteWhere }));

insertValues.mockResolvedValue(undefined);
insert.mockImplementation(() => ({ values: insertValues }));

vi.mock("@/lib/db", () => ({
  db: {
    select,
    insert,
    delete: deleteDb,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  shows: {
    id: "id",
    name: "name",
  },
  showsWatched: {
    userId: "user_id",
    showId: "show_id",
  },
}));

import { getWatchedShowIds, listWatchedShows, toggleShowWatched } from "./watched-shows.server";

describe("getWatchedShowIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    select.mockImplementation(() => ({
      from: () => ({
        where: () => mockWhereResult([{ showId: 1 }, { showId: 3 }]),
      }),
    }));
  });

  it("returns watched show ids for the user", async () => {
    const watched = await getWatchedShowIds(USER_ID, [1, 2, 3]);

    expect(watched).toEqual(new Set([1, 3]));
  });

  it("returns an empty set when no show ids are requested", async () => {
    const watched = await getWatchedShowIds(USER_ID, []);

    expect(watched).toEqual(new Set());
    expect(select).not.toHaveBeenCalled();
  });
});

describe("listWatchedShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    select.mockImplementation(() => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () =>
              Promise.resolve([
                { id: 2, name: "Better Call Saul" },
                { id: 1, name: "Breaking Bad" },
              ]),
          }),
        }),
      }),
    }));
  });

  it("returns watched shows ordered by name", async () => {
    const watchedShows = await listWatchedShows(USER_ID);

    expect(watchedShows).toEqual([
      { id: 2, name: "Better Call Saul" },
      { id: 1, name: "Breaking Bad" },
    ]);
  });
});

describe("toggleShowWatched", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteWhere.mockResolvedValue(undefined);
    insertValues.mockResolvedValue(undefined);
    select.mockImplementation(() => ({
      from: () => ({
        where: () => mockWhereResult([]),
      }),
    }));
  });

  it("marks a show as watched when it is not watched yet", async () => {
    const watched = await toggleShowWatched(USER_ID, SHOW_ID);

    expect(watched).toBe(true);
    expect(insert).toHaveBeenCalledOnce();
    expect(insertValues).toHaveBeenCalledWith({ userId: USER_ID, showId: SHOW_ID });
    expect(deleteDb).not.toHaveBeenCalled();
  });

  it("unmarks a show when it is already watched", async () => {
    select.mockImplementation(() => ({
      from: () => ({
        where: () => mockWhereResult([{ showId: SHOW_ID }]),
      }),
    }));

    const watched = await toggleShowWatched(USER_ID, SHOW_ID);

    expect(watched).toBe(false);
    expect(deleteDb).toHaveBeenCalledOnce();
    expect(deleteWhere).toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});
