import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const SAMPLE_ROW = {
  id: 1,
  name: "Arrow",
  type: "Scripted",
  status: "Ended",
  image: "https://static.tvmaze.com/uploads/images/original_untouched/143/358967.jpg",
};

const { limit, orderBy, select } = vi.hoisted(() => ({
  limit: vi.fn(),
  orderBy: vi.fn(),
  select: vi.fn(),
}));

limit.mockImplementation(() => Promise.resolve([SAMPLE_ROW]));
orderBy.mockImplementation(() => ({ limit }));
select.mockImplementation(() => ({
  from: () => ({
    where: () => ({
      orderBy,
    }),
  }),
}));

vi.mock("@/lib/db", () => ({ db: { select } }));
vi.mock("@/lib/db/schema", () => ({
  shows: {
    id: "id",
    name: "name",
    type: "type",
    status: "status",
    weight: "weight",
    image: "image",
  },
}));

import { searchShows } from "./search-shows";

describe("searchShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockImplementation(() => Promise.resolve([SAMPLE_ROW]));
    orderBy.mockImplementation(() => ({ limit }));
    select.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          orderBy,
        }),
      }),
    }));
  });

  it("returns an empty array for short queries", async () => {
    const results = await searchShows("a");

    expect(results).toEqual([]);
    expect(select).not.toHaveBeenCalled();
  });

  it("returns matching shows for a valid query", async () => {
    const results = await searchShows("arr");

    expect(results).toEqual([
      {
        id: 1,
        name: "Arrow",
        type: "Scripted",
        status: "Ended",
        imageUrl: "https://static.tvmaze.com/uploads/images/original_untouched/143/358967.jpg",
      },
    ]);
    expect(limit).toHaveBeenCalledWith(8);
  });
});
