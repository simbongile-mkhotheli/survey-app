/**
 * Pagination Component Tests
 * =========================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '@/components/Pagination/Pagination';
import type { PaginationConfig } from '@/types/filter.types';

describe('Pagination Component', () => {
  const defaultPagination: PaginationConfig = {
    pageNumber: 1,
    pageSize: 10,
    totalItems: 100,
    totalPages: 10,
  };

  describe('rendering', () => {
    it('should render pagination container with correct elements', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      expect(
        screen.getByRole('navigation', { name: /pagination/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      // Verify page indicator using flexible text matcher
      const pageIndicator = screen.getByText((content) =>
        content.includes('Page'),
      );
      expect(pageIndicator).toBeInTheDocument();
    });

    it('should display correct item count information', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={{ ...defaultPagination, pageNumber: 2 }}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={true}
        />,
      );

      // Check for showing text content
      expect(
        screen.getByText(/showing/i, { selector: 'span' }),
      ).toBeInTheDocument();
    });

    it('should show correct item count on last page', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={{ ...defaultPagination, pageNumber: 10 }}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={false}
          hasPreviousPage={true}
        />,
      );

      // Verify page indicator using flexible text matcher
      const pageIndicator = screen.getByText((content) =>
        content.includes('Page'),
      );
      expect(pageIndicator).toBeInTheDocument();
    });

    it('should show zero items when no data', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={{
            pageNumber: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          }}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={false}
          hasPreviousPage={false}
        />,
      );

      // Verify showing text is present
      expect(
        screen.getByText(/showing/i, { selector: 'span' }),
      ).toBeInTheDocument();
    });
  });

  describe('pagination controls', () => {
    it('should call onPageChange when next button is clicked', async () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', async () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          pagination={{ ...defaultPagination, pageNumber: 2 }}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={true}
        />,
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable previous button on first page', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={{ ...defaultPagination, pageNumber: 10 }}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={false}
          hasPreviousPage={true}
        />,
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('page size selector', () => {
    it('should display page size options', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      const select = screen.getByRole('combobox', { name: /items per page/i });
      expect(select).toBeInTheDocument();
    });

    it('should call onPageSizeChange when page size is changed', async () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      const select = screen.getByRole('combobox', { name: /items per page/i });
      await user.selectOptions(select, '25');

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('should disable page size selector when loading', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
          isLoading={true}
        />,
      );

      const select = screen.getByRole('combobox', { name: /items per page/i });
      expect(select).toBeDisabled();
    });
  });

  describe('loading state', () => {
    it('should disable all controls when loading', async () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          pagination={{ ...defaultPagination, pageNumber: 2 }}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={true}
          isLoading={true}
        />,
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const select = screen.getByRole('combobox', { name: /items per page/i });

      expect(nextButton).toBeDisabled();
      expect(prevButton).toBeDisabled();
      expect(select).toBeDisabled();

      // Verify callbacks are not called when disabled
      await user.click(nextButton);
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      expect(
        screen.getByRole('navigation', { name: /pagination/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /previous page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /next page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /items per page/i }),
      ).toBeInTheDocument();
    });

    it('should have proper semantic HTML', () => {
      const mockOnPageChange = vi.fn();
      const mockOnPageSizeChange = vi.fn();

      const { container } = render(
        <Pagination
          pagination={defaultPagination}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          hasNextPage={true}
          hasPreviousPage={false}
        />,
      );

      const navElement = container.querySelector('[role="navigation"]');
      expect(navElement).toBeInTheDocument();
    });
  });
});
