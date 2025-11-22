/**
 * Results Component Tests
 * ======================
 * Tests for the Results display component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Results from '@/components/Results/Results';

// Mock the store
const mockUseResults = vi.fn();
vi.mock('@/store/useSurveyStore', () => ({
  useResults: () => mockUseResults(),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Loading: ({ text }: { text: string }) => <div>{text}</div>,
  ErrorMessage: ({ title, message }: { title: string; message: string }) => (
    <div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  ),
}));

const mockResults = {
  totalCount: 10,
  age: {
    avg: 28.5,
    min: 18,
    max: 65,
  },
  foodPercentages: {
    pizza: 45.5,
    pasta: 30.2,
    papAndWors: 24.3,
  },
  avgRatings: {
    movies: 4.2,
    radio: 3.1,
    eatOut: 4.8,
    tv: 3.5,
  },
};

describe('Results', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    mockUseResults.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchResults: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('Loading survey results...')).toBeInTheDocument();
  });

  it('displays results when data is loaded', async () => {
    mockUseResults.mockReturnValue({
      data: mockResults,
      loading: false,
      error: null,
      fetchResults: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('Survey Results')).toBeInTheDocument();
    expect(screen.getByText('Total number of surveys')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Average Age')).toBeInTheDocument();
    expect(screen.getByText(/28\.5/)).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    mockUseResults.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load results',
      fetchResults: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('Failed to Load Results')).toBeInTheDocument();
  });

  it('displays empty state when no results', async () => {
    const emptyResults = {
      totalCount: 0,
      age: { avg: null, min: null, max: null },
      foodPercentages: { pizza: null, pasta: null, papAndWors: null },
      avgRatings: { movies: null, radio: null, eatOut: null, tv: null },
    };

    mockUseResults.mockReturnValue({
      data: emptyResults,
      loading: false,
      error: null,
      fetchResults: vi.fn(),
    });

    render(<Results />);

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No survey responses available yet. Be the first to submit a survey!',
      ),
    ).toBeInTheDocument();
  });
});
