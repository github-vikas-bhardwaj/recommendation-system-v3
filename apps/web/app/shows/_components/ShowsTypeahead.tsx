"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { searchShowsAction } from "@/app/shows/actions/search-shows.action";
import { toggleWatchedAction } from "@/app/shows/actions/toggle-watched.action";
import {
  SHOWS_SEARCH_DROPDOWN_SCROLL_AFTER,
  SHOWS_SEARCH_MIN_LENGTH,
} from "@/lib/shows/search-shows.constants";
import type { ShowSearchResultWithWatched } from "@/lib/shows/show.types";

import styles from "../shows.module.css";

const DEBOUNCE_MS = 300;

type ShowsTypeaheadProps = {
  total: number;
};

function resetSearchState() {
  return {
    results: [] as ShowSearchResultWithWatched[],
    canMarkWatched: false,
    error: null as string | null,
    fetchedQuery: "",
  };
}

export function ShowsTypeahead({ total }: ShowsTypeaheadProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState(resetSearchState);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= SHOWS_SEARCH_MIN_LENGTH;
  const isLoading = shouldSearch && searchState.fetchedQuery !== trimmedQuery;
  const showDropdown = isOpen && shouldSearch;

  useEffect(() => {
    if (!shouldSearch) {
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const result = await searchShowsAction(trimmedQuery);

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setSearchState({
          results: [],
          canMarkWatched: false,
          error: result.error,
          fetchedQuery: trimmedQuery,
        });
        return;
      }

      setSearchState({
        results: result.shows,
        canMarkWatched: result.canToggleWatched,
        error: null,
        fetchedQuery: trimmedQuery,
      });
      setIsOpen(true);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [shouldSearch, trimmedQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setIsOpen(true);

    if (value.trim().length < SHOWS_SEARCH_MIN_LENGTH) {
      setSearchState(resetSearchState());
    }
  }

  function handleToggleWatched(show: ShowSearchResultWithWatched) {
    setSearchState((current) => ({ ...current, error: null }));
    setPendingId(show.id);

    startTransition(async () => {
      const result = await toggleWatchedAction(show.id);

      if (!result.ok) {
        setSearchState((current) => ({ ...current, error: result.error }));
        setPendingId(null);
        return;
      }

      setSearchState((current) => ({
        ...current,
        results: current.results.map((item) =>
          item.id === show.id ? { ...item, isWatched: result.watched } : item
        ),
      }));
      setPendingId(null);
    });
  }

  const { results, canMarkWatched, error } = searchState;

  return (
    <div className={styles.searchForm} ref={containerRef} role="search">
      <label className={styles.searchLabel} htmlFor="shows-search">
        Search shows
      </label>

      <div className={styles.searchFieldWrap}>
        <input
          id="shows-search"
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            if (shouldSearch) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Search by show name…"
          className={styles.searchInput}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
        />

        {showDropdown ? (
          <div className={styles.searchDropdown} id={listboxId} role="listbox">
            {isLoading ? <p className={styles.searchDropdownMessage}>Searching…</p> : null}

            {!isLoading && error ? (
              <p className={styles.searchDropdownError} role="alert">
                {error}
              </p>
            ) : null}

            {!isLoading && !error && results.length === 0 ? (
              <p className={styles.searchDropdownMessage}>No shows found.</p>
            ) : null}

            {!isLoading && !error && results.length > 0 ? (
              <ul
                className={`${styles.searchDropdownList} ${
                  results.length > SHOWS_SEARCH_DROPDOWN_SCROLL_AFTER
                    ? styles.searchDropdownListScrollable
                    : ""
                }`}
              >
                {results.map((show) => {
                  const toggling = isPending && pendingId === show.id;

                  return (
                    <li
                      key={show.id}
                      className={styles.searchDropdownItem}
                      role="option"
                      aria-selected={false}
                    >
                      <div className={styles.searchDropdownMain}>
                        <div className={styles.searchDropdownThumb}>
                          {show.imageUrl ? (
                            <Image
                              src={show.imageUrl}
                              alt=""
                              fill
                              sizes="44px"
                              className={styles.searchDropdownThumbImage}
                            />
                          ) : (
                            <span
                              className={styles.searchDropdownThumbPlaceholder}
                              aria-hidden="true"
                            >
                              TV
                            </span>
                          )}
                        </div>

                        <div className={styles.searchDropdownText}>
                          <span className={styles.searchDropdownName}>{show.name}</span>
                          <span className={styles.searchDropdownMeta}>
                            {show.type} · {show.status}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={
                          show.isWatched ? styles.searchDropdownWatched : styles.searchDropdownWatch
                        }
                        onClick={() => handleToggleWatched(show)}
                        disabled={toggling || !canMarkWatched}
                        aria-pressed={show.isWatched}
                        title={canMarkWatched ? undefined : "Sign in to mark shows as watched"}
                      >
                        {toggling ? "Saving…" : show.isWatched ? "Watched" : "Mark watched"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className={styles.searchMeta}>{total.toLocaleString()} shows in the catalog</p>
    </div>
  );
}
