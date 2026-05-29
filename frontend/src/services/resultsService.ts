import { supabase } from './supabaseClient';

export type ResultsData = {
  totalCount: number;
  age: {
    avg: number | null;
    min: number | null;
    max: number | null;
  };
  foodPercentages: {
    pizza: number | null;
    pasta: number | null;
    papAndWors: number | null;
  };
  avgRatings: {
    movies: number | null;
    radio: number | null;
    eatOut: number | null;
    tv: number | null;
  };
};

type AggregateResultsRow = {
  total_count: number;
  avg_age: number | string | null;
  min_age: number | null;
  max_age: number | null;
  pizza_percentage: number | string | null;
  pasta_percentage: number | string | null;
  pap_and_wors_percentage: number | string | null;
  movies_average: number | string | null;
  radio_average: number | string | null;
  eat_out_average: number | string | null;
  tv_average: number | string | null;
};

const emptyResults: ResultsData = {
  totalCount: 0,
  age: { avg: null, min: null, max: null },
  foodPercentages: {
    pizza: null,
    pasta: null,
    papAndWors: null,
  },
  avgRatings: {
    movies: null,
    radio: null,
    eatOut: null,
    tv: null,
  },
};

const toNullableNumber = (value: number | string | null) => {
  if (value == null) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

function mapAggregateResults(row: AggregateResultsRow | null): ResultsData {
  if (!row || row.total_count === 0) {
    return emptyResults;
  }

  return {
    totalCount: row.total_count,
    age: {
      avg: toNullableNumber(row.avg_age),
      min: row.min_age,
      max: row.max_age,
    },
    foodPercentages: {
      pizza: toNullableNumber(row.pizza_percentage),
      pasta: toNullableNumber(row.pasta_percentage),
      papAndWors: toNullableNumber(row.pap_and_wors_percentage),
    },
    avgRatings: {
      movies: toNullableNumber(row.movies_average),
      radio: toNullableNumber(row.radio_average),
      eatOut: toNullableNumber(row.eat_out_average),
      tv: toNullableNumber(row.tv_average),
    },
  };
}

export async function fetchResults(): Promise<ResultsData> {
  const { data, error } = await supabase.rpc('get_survey_results');

  if (error) {
    throw new Error(error.message);
  }

  const rows = data as AggregateResultsRow[] | null;
  return mapAggregateResults(rows?.[0] ?? null);
}
