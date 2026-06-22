import { describe, expect, it } from "vitest";

import { formatYear, parseGenres, stripHtml, toShowListItem } from "./format-show";

const SAMPLE_ROW = {
  id: 5,
  name: "True Detective",
  type: "Scripted",
  language: "English",
  genres: '["Drama","Crime"]',
  status: "Running",
  premiered: new Date("2014-01-12T00:00:00.000Z"),
  ended: null,
  weight: 98,
  image: null,
  summary: "<p>Dark anthology crime drama.</p>",
};

describe("parseGenres", () => {
  it("parses a JSON string array", () => {
    expect(parseGenres('["Drama","Action"]')).toEqual(["Drama", "Action"]);
  });

  it("returns an empty array for invalid JSON", () => {
    expect(parseGenres("not-json")).toEqual([]);
  });

  it("filters non-string genre values", () => {
    expect(parseGenres('["Drama", 1, null]')).toEqual(["Drama"]);
  });
});

describe("stripHtml", () => {
  it("removes HTML tags from summaries", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });
});

describe("formatYear", () => {
  it("returns null for missing dates", () => {
    expect(formatYear(null)).toBeNull();
  });

  it("returns the UTC year for a date", () => {
    expect(formatYear(new Date("2014-01-12T00:00:00.000Z"))).toBe("2014");
  });
});

describe("toShowListItem", () => {
  it("maps a database row into a show list item", () => {
    expect(toShowListItem(SAMPLE_ROW)).toEqual({
      id: 5,
      name: "True Detective",
      type: "Scripted",
      language: "English",
      genres: ["Drama", "Crime"],
      status: "Running",
      premieredYear: "2014",
      endedYear: null,
      weight: 98,
      imageUrl: null,
      summary: "Dark anthology crime drama.",
    });
  });
});
