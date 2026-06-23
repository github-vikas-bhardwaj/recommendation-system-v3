import "server-only";

import { count, desc, ilike, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { shows } from "@/lib/db/schema";

import { toShowListItem } from "./format-show";
import type { ListShowsResult } from "./show.types";

export const SHOWS_PAGE_SIZE = 25;

function normalizePage(page: number): number {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function normalizeQuery(query: string | undefined): string {
  return query?.trim() ?? "";
}

export async function listShows(options: {
  page?: number;
  query?: string;
  pageSize?: number;
}): Promise<ListShowsResult> {
  const page = normalizePage(options.page ?? 1);
  const query = normalizeQuery(options.query);
  const pageSize = options.pageSize ?? SHOWS_PAGE_SIZE;

  const whereClause = query ? ilike(shows.name, `%${query}%`) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(shows).where(whereClause);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const currentOffset = (currentPage - 1) * pageSize;

  const rows = await db
    .select()
    .from(shows)
    .where(whereClause)
    .orderBy(desc(shows.weight), sql`lower(${shows.name})`)
    .limit(pageSize)
    .offset(currentOffset);

  return {
    shows: rows.map(toShowListItem),
    total,
    page: currentPage,
    pageSize,
    totalPages,
    query,
  };
}
