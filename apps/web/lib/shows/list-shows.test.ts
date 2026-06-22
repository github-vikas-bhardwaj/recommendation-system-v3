import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const SAMPLE_ROW = {
  id: 1,
  name: "Arrow",
  type: "Scripted",
  language: "English",
  genres: '["Drama","Action"]',
  status: "Ended",
  premiered: new Date("2012-10-10T00:00:00.000Z"),
  ended: new Date("2020-01-28T00:00:00.000Z"),
  weight: 99,
  image: "https://static.tvmaze.com/uploads/images/original_untouched/143/358967.jpg",
  summary: "<p>Superhero show.</p>",
};

const { offset, limit, orderBy, select } = vi.hoisted(() => ({
  offset: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  select: vi.fn(),
}));

function mockListShowsQueries(options: { total: number; rows: (typeof SAMPLE_ROW)[] }) {
  let selectCall = 0;

  offset.mockImplementation(() => Promise.resolve(options.rows));
  limit.mockImplementation(() => ({ offset }));
  orderBy.mockImplementation(() => ({ limit }));
  select.mockImplementation(() => {
    selectCall += 1;

    if (selectCall === 1) {
      return {
        from: () => ({
          where: () => Promise.resolve([{ total: options.total }]),
        }),
      };
    }

    return {
      from: () => ({
        where: () => ({
          orderBy,
        }),
      }),
    };
  });
}

vi.mock("@/lib/db", () => ({
  db: { select },
}));

import { listShows, SHOWS_PAGE_SIZE } from "./list-shows";

describe("listShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the first page of shows ordered by weight", async () => {
    mockListShowsQueries({ total: 1, rows: [SAMPLE_ROW] });

    const result = await listShows({ page: 1 });

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(SHOWS_PAGE_SIZE);
    expect(result.totalPages).toBe(1);
    expect(result.query).toBe("");
    expect(result.shows).toHaveLength(1);
    expect(result.shows[0]).toMatchObject({
      id: 1,
      name: "Arrow",
      genres: ["Drama", "Action"],
      summary: "Superhero show.",
      premieredYear: "2012",
      endedYear: "2020",
    });
    expect(limit).toHaveBeenCalledWith(SHOWS_PAGE_SIZE);
    expect(offset).toHaveBeenCalledWith(0);
  });

  it("applies pagination offset for later pages", async () => {
    mockListShowsQueries({ total: 60, rows: [SAMPLE_ROW] });

    const result = await listShows({ page: 3, pageSize: 25 });

    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(3);
    expect(offset).toHaveBeenCalledWith(50);
  });

  it("clamps invalid page numbers to page 1", async () => {
    mockListShowsQueries({ total: 10, rows: [SAMPLE_ROW] });

    const result = await listShows({ page: 0 });

    expect(result.page).toBe(1);
    expect(offset).toHaveBeenCalledWith(0);
  });

  it("clamps page above totalPages to the last page", async () => {
    mockListShowsQueries({ total: 30, rows: [SAMPLE_ROW] });

    const result = await listShows({ page: 99, pageSize: 25 });

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(offset).toHaveBeenCalledWith(25);
  });

  it("returns trimmed search query in the result", async () => {
    mockListShowsQueries({ total: 2, rows: [SAMPLE_ROW] });

    const result = await listShows({ query: "  arrow  " });

    expect(result.query).toBe("arrow");
    expect(result.total).toBe(2);
  });

  it("returns an empty result when no shows match", async () => {
    mockListShowsQueries({ total: 0, rows: [] });

    const result = await listShows({ query: "missing-show" });

    expect(result.shows).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
  });
});
