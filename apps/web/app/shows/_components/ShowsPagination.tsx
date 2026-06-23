import Link from "next/link";

import styles from "../shows.module.css";

type ShowsPaginationProps = {
  page: number;
  totalPages: number;
};

function buildShowsHref(page: number): string {
  if (page <= 1) {
    return "/shows";
  }

  return `/shows?page=${page}`;
}

export function ShowsPagination({ page, totalPages }: ShowsPaginationProps) {
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
        <Link href={buildShowsHref(previousPage)} className={styles.paginationButton}>
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
              href={buildShowsHref(pageNumber)}
              className={styles.paginationPage}
            >
              {pageNumber}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={buildShowsHref(nextPage)} className={styles.paginationButton}>
          Next
        </Link>
      ) : (
        <span className={styles.paginationButtonDisabled}>Next</span>
      )}
    </nav>
  );
}
