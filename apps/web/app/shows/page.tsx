import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth/session/get-session";
import { listShows } from "@/lib/shows/list-shows";
import { getWatchedShowIds } from "@/lib/shows/watched-shows.server";

import { ShowCard } from "./_components/ShowCard";
import { ShowsPagination } from "./_components/ShowsPagination";
import { ShowsSearch } from "./_components/ShowsSearch";
import styles from "./shows.module.css";

export const metadata: Metadata = {
  title: "Shows — Browse the catalog",
  description: "Explore thousands of TV shows with search and pagination.",
};

type ShowsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function ShowsPage({ searchParams }: ShowsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const query = params.q ?? "";

  const result = await listShows({ page, query });
  const user = await getSessionUser();
  const watchedShowIds = user
    ? await getWatchedShowIds(
        user.id,
        result.shows.map((show) => show.id)
      )
    : new Set<number>();

  const rangeStart = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>TV catalog</span>
          <h1 className={styles.title}>
            Discover your next <span className={styles.titleAccent}>binge</span>
          </h1>
          <p className={styles.subtitle}>
            Browse curated shows from our database — search by title, explore genres, and find
            something worth watching tonight.
          </p>
        </header>

        <ShowsSearch query={result.query} total={result.total} />

        {result.shows.length > 0 ? (
          <>
            <p className={styles.resultsLine}>
              Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{" "}
              {result.total.toLocaleString()}
              {result.query ? ` matching “${result.query}”` : ""}
            </p>

            <ul className={styles.grid}>
              {result.shows.map((show) => (
                <li key={show.id}>
                  <ShowCard
                    show={show}
                    isWatched={watchedShowIds.has(show.id)}
                    canToggleWatched={Boolean(user)}
                  />
                </li>
              ))}
            </ul>

            <ShowsPagination
              page={result.page}
              totalPages={result.totalPages}
              query={result.query}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No shows found</p>
            <p className={styles.emptyText}>
              {result.query
                ? `We couldn’t find anything matching “${result.query}”. Try a different title.`
                : "The catalog is empty. Run the import script to load shows."}
            </p>
            {result.query ? (
              <a href="/shows" className={styles.emptyLink}>
                View all shows
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
