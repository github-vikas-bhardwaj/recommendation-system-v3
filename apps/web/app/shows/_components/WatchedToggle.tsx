"use client";

import { useState, useTransition } from "react";

import { toggleWatchedAction } from "../actions/toggle-watched.action";
import styles from "../shows.module.css";

type WatchedToggleProps = {
  showId: number;
  initialWatched: boolean;
};

export function WatchedToggle({ showId, initialWatched }: WatchedToggleProps) {
  const [watched, setWatched] = useState(initialWatched);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setError(null);

    startTransition(async () => {
      const result = await toggleWatchedAction(showId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setWatched(result.watched);
    });
  }

  return (
    <div className={styles.watchedWrap}>
      <button
        type="button"
        className={watched ? styles.watchedButtonActive : styles.watchedButton}
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={watched}
        aria-label={watched ? "Mark as not watched" : "Mark as watched"}
      >
        {isPending ? "Saving…" : watched ? "Watched" : "Mark watched"}
      </button>
      {error ? (
        <p className={styles.watchedError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
