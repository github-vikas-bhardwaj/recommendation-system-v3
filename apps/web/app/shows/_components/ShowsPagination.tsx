import Link from "next/link";

import styles from "../shows.module.css";

type ShowsPaginationProps = {
  page: number;
  totalPages: number;
  query: string;
};

function buildShowsHref(page: number, query: string): string {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();

  return search ? `/shows?${search}` : "/shows";
}

export function ShowsPagination({ page, totalPages, query }: ShowsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);
  const pageNumbers = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, index) => windowStart + index
  );

  return (
    <nav className={styles.pagination} aria-label="Shows pagination">
      {page > 1 ? (
        <Link href={buildShowsHref(previousPage, query)} className={styles.paginationButton}>
          Previous
        </Link>
      ) : (
        <span className={styles.paginationButtonDisabled}>Previous</span>
      )}

      <div className={styles.paginationPages}>
        {pageNumbers.map((pageNumber) =>
          pageNumber === page ? (
            <span key={pageNumber} className={styles.paginationPageActive} aria-current="page">
              {pageNumber}
            </span>
          ) : (
            <Link
              key={pageNumber}
              href={buildShowsHref(pageNumber, query)}
              className={styles.paginationPage}
            >
              {pageNumber}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={buildShowsHref(nextPage, query)} className={styles.paginationButton}>
          Next
        </Link>
      ) : (
        <span className={styles.paginationButtonDisabled}>Next</span>
      )}
    </nav>
  );
}
