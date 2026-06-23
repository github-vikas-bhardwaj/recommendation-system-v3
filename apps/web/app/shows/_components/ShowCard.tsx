import Image from "next/image";

import type { ShowListItem } from "@/lib/shows/show.types";

import styles from "../shows.module.css";
import { WatchedToggle } from "./WatchedToggle";

type ShowCardProps = {
  show: ShowListItem;
  isWatched: boolean;
  canToggleWatched: boolean;
};

function statusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "running":
      return styles.statusRunning;
    case "ended":
      return styles.statusEnded;
    case "to be determined":
      return styles.statusTbd;
    default:
      return styles.statusDefault;
  }
}

function formatYears(
  premieredYear: string | null,
  endedYear: string | null,
  status: string
): string {
  if (premieredYear && endedYear) {
    return `${premieredYear} - ${endedYear}`;
  }

  if (premieredYear) {
    return status.toLowerCase() === "running"
      ? `${premieredYear} - Present`
      : `Since ${premieredYear}`;
  }

  return "Year unknown";
}

export function ShowCard({ show, isWatched, canToggleWatched }: ShowCardProps) {
  const summary =
    show.summary.length > 180 ? `${show.summary.slice(0, 177).trimEnd()}…` : show.summary;

  return (
    <article className={styles.card}>
      <div className={styles.cardMedia}>
        {show.imageUrl ? (
          <Image
            src={show.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.cardPlaceholder} aria-hidden="true">
            <span className={styles.cardPlaceholderIcon}>TV</span>
          </div>
        )}
        <div className={styles.cardMediaOverlay} />
        {canToggleWatched ? (
          <div className={styles.watchedSlot}>
            <WatchedToggle showId={show.id} initialWatched={isWatched} />
          </div>
        ) : null}
        <span className={`${styles.statusBadge} ${statusClass(show.status)}`}>{show.status}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMetaRow}>
          <span className={styles.cardType}>{show.type}</span>
          <span className={styles.cardDot} aria-hidden="true">
            ·
          </span>
          <span className={styles.cardLanguage}>{show.language}</span>
        </div>

        <h2 className={styles.cardTitle}>{show.name}</h2>

        <p className={styles.cardYears}>
          {formatYears(show.premieredYear, show.endedYear, show.status)}
        </p>

        {show.genres.length > 0 ? (
          <ul className={styles.genreList} aria-label="Genres">
            {show.genres.slice(0, 3).map((genre) => (
              <li key={genre} className={styles.genreChip}>
                {genre}
              </li>
            ))}
            {show.genres.length > 3 ? (
              <li className={styles.genreChipMuted}>+{show.genres.length - 3}</li>
            ) : null}
          </ul>
        ) : null}

        <p className={styles.cardSummary}>{summary}</p>
      </div>
    </article>
  );
}
