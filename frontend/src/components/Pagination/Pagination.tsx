/**
 * Pagination Component
 * ===================
 * Advanced pagination UI with page navigation and page size selection
 */

import { memo, useCallback } from 'react';
import styles from './Pagination.module.css';
import type { PaginationConfig } from '@/types/filter.types';

export interface PaginationProps {
  pagination: PaginationConfig;
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading?: boolean;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

/**
 * Pagination component with navigation controls
 */
const Pagination = memo<PaginationProps>(
  ({
    pagination,
    onPageChange,
    onPageSizeChange,
    hasNextPage,
    hasPreviousPage,
    isLoading = false,
  }) => {
    const { pageNumber, pageSize, totalItems, totalPages } = pagination;

    const handlePreviousPage = useCallback(() => {
      if (hasPreviousPage && !isLoading) {
        onPageChange(pageNumber - 1);
      }
    }, [hasPreviousPage, isLoading, onPageChange, pageNumber]);

    const handleNextPage = useCallback(() => {
      if (hasNextPage && !isLoading) {
        onPageChange(pageNumber + 1);
      }
    }, [hasNextPage, isLoading, onPageChange, pageNumber]);

    const handlePageSizeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        if (!isLoading) {
          onPageSizeChange(newSize);
        }
      },
      [isLoading, onPageSizeChange],
    );

    const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endItem = Math.min(pageNumber * pageSize, totalItems);

    return (
      <div
        className={styles.container}
        role="navigation"
        aria-label="Pagination"
      >
        <div className={styles.info}>
          <span className={styles.itemCount}>
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong>{' '}
            of <strong>{totalItems}</strong> items
          </span>
        </div>

        <div className={styles.controls}>
          {/* Page size selector */}
          <div className={styles.pageSizeSelector}>
            <label htmlFor="page-size-select" className={styles.label}>
              Items per page:
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={isLoading}
              className={styles.select}
              aria-label="Items per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation buttons */}
          <div className={styles.buttons}>
            <button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage || isLoading}
              className={styles.button}
              aria-label="Previous page"
              title="Go to previous page"
            >
              ← Previous
            </button>

            <span className={styles.pageIndicator}>
              Page <strong>{pageNumber}</strong> of{' '}
              <strong>{totalPages}</strong>
            </span>

            <button
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoading}
              className={styles.button}
              aria-label="Next page"
              title="Go to next page"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  },
);

Pagination.displayName = 'Pagination';

export default Pagination;
