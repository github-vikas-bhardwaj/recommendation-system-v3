import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session/get-session";
import { listShows } from "@/lib/shows/list-shows";
import { getWatchedShowIds } from "@/lib/shows/watched-shows.server";

import { ShowCard } from "./_components/ShowCard";
import { ShowsPagination } from "./_components/ShowsPagination";
import { ShowsTypeahead } from "./_components/ShowsTypeahead";
import styles from "./shows.module.css";

export const metadata: Metadata = {
  title: "Shows — Browse the catalog",
  description: "Explore thousands of TV shows with search and pagination.",
};

type ShowsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function ShowsPage({ searchParams }: ShowsPageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const result = await listShows({ page });
  const watchedShowIds = await getWatchedShowIds(
    user.id,
    result.shows.map((show) => show.id)
  );

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

        <ShowsTypeahead total={result.total} />

        {result.shows.length > 0 ? (
          <>
            <p className={styles.resultsLine}>
              Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{" "}
              {result.total.toLocaleString()}
            </p>

            <ul className={styles.grid}>
              {result.shows.map((show) => (
                <li key={show.id}>
                  <ShowCard show={show} isWatched={watchedShowIds.has(show.id)} canToggleWatched />
                </li>
              ))}
            </ul>

            <ShowsPagination page={result.page} totalPages={result.totalPages} />
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No shows found</p>
            <p className={styles.emptyText}>
              The catalog is empty. Run the import script to load shows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
