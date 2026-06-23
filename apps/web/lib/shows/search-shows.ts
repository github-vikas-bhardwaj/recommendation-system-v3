import "server-only";

import { desc, ilike, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { shows } from "@/lib/db/schema";

import { toShowSearchResult } from "./format-show";
import { SHOWS_SEARCH_LIMIT, SHOWS_SEARCH_MIN_LENGTH } from "./search-shows.constants";
import type { ShowSearchResult } from "./show.types";

export { SHOWS_SEARCH_MIN_LENGTH } from "./search-shows.constants";

function normalizeQuery(query: string): string {
  return query.trim();
}

export async function searchShows(
  query: string,
  limit = SHOWS_SEARCH_LIMIT
): Promise<ShowSearchResult[]> {
  const normalizedQuery = normalizeQuery(query);

  if (normalizedQuery.length < SHOWS_SEARCH_MIN_LENGTH) {
    return [];
  }

  const rows = await db
    .select({
      id: shows.id,
      name: shows.name,
      type: shows.type,
      status: shows.status,
      image: shows.image,
    })
    .from(shows)
    .where(ilike(shows.name, `%${normalizedQuery}%`))
    .orderBy(desc(shows.weight), sql`lower(${shows.name})`)
    .limit(limit);

  return rows.map(toShowSearchResult);
}
