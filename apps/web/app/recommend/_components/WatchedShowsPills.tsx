"use client";

import { useMemo, useState, useTransition } from "react";

import { toggleWatchedAction } from "@/app/shows/actions/toggle-watched.action";
import type { WatchedShowItem } from "@/lib/shows/show.types";

import styles from "../recommend.module.css";

type WatchedShowsPillsProps = {
  shows: WatchedShowItem[];
};

function CrossIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WatchedShowsPills({ shows: serverShows }: WatchedShowsPillsProps) {
  const [removedIds, setRemovedIds] = useState<ReadonlySet<number>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const shows = useMemo(
    () => serverShows.filter((show) => !removedIds.has(show.id)),
    [removedIds, serverShows]
  );

  if (shows.length === 0) {
    return null;
  }

  function handleRemove(show: WatchedShowItem) {
    setError(null);
    setPendingId(show.id);

    startTransition(async () => {
      const result = await toggleWatchedAction(show.id);

      if (!result.ok) {
        setError(result.error);
        setPendingId(null);
        return;
      }

      setRemovedIds((current) => new Set(current).add(show.id));
      setPendingId(null);
    });
  }

  return (
    <section className={styles.watchedSection} aria-label="Watched shows">
      <h2 className={styles.watchedSectionTitle}>Your watched shows</h2>

      <ul className={styles.watchedPills}>
        {shows.map((show) => {
          const removing = isPending && pendingId === show.id;

          return (
            <li key={show.id}>
              <span className={styles.watchedPill}>
                <span className={styles.watchedPillLabel}>{show.name}</span>
                <button
                  type="button"
                  className={styles.watchedPillRemove}
                  onClick={() => handleRemove(show)}
                  disabled={removing}
                  aria-label={`Remove ${show.name} from watched`}
                >
                  <CrossIcon />
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className={styles.watchedPillsError} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
