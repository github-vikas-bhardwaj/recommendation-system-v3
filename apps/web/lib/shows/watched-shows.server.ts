import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { shows, showsWatched } from "@/lib/db/schema";

import type { WatchedShowItem } from "./show.types";

export async function listWatchedShows(userId: string): Promise<WatchedShowItem[]> {
  const rows = await db
    .select({
      id: shows.id,
      name: shows.name,
    })
    .from(showsWatched)
    .innerJoin(shows, eq(showsWatched.showId, shows.id))
    .where(eq(showsWatched.userId, userId))
    .orderBy(sql`lower(${shows.name})`);

  return rows;
}

export async function getWatchedShowIds(userId: string, showIds: number[]): Promise<Set<number>> {
  if (showIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .select({ showId: showsWatched.showId })
    .from(showsWatched)
    .where(and(eq(showsWatched.userId, userId), inArray(showsWatched.showId, showIds)));

  return new Set(rows.map((row) => row.showId));
}

export async function toggleShowWatched(userId: string, showId: number): Promise<boolean> {
  const [existing] = await db
    .select({ showId: showsWatched.showId })
    .from(showsWatched)
    .where(and(eq(showsWatched.userId, userId), eq(showsWatched.showId, showId)))
    .limit(1);

  if (existing) {
    await db
      .delete(showsWatched)
      .where(and(eq(showsWatched.userId, userId), eq(showsWatched.showId, showId)));

    return false;
  }

  await db.insert(showsWatched).values({ userId, showId });

  return true;
}
