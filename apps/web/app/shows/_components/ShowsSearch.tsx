import styles from "../shows.module.css";

type ShowsSearchProps = {
  query: string;
  total: number;
};

export function ShowsSearch({ query, total }: ShowsSearchProps) {
  return (
    <form className={styles.searchForm} action="/shows" method="get" role="search">
      <label className={styles.searchLabel} htmlFor="shows-search">
        Search shows
      </label>
      <div className={styles.searchRow}>
        <input
          id="shows-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by show name…"
          className={styles.searchInput}
          autoComplete="off"
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
        {query ? (
          <a href="/shows" className={styles.searchClear}>
            Clear
          </a>
        ) : null}
      </div>
      <p className={styles.searchMeta}>
        {query
          ? `${total.toLocaleString()} result${total === 1 ? "" : "s"} for “${query}”`
          : `${total.toLocaleString()} shows in the catalog`}
      </p>
    </form>
  );
}
