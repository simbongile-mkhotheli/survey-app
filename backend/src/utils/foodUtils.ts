export function toCSV(foods: string[]): string {
  return foods.join(',');
}

export function fromCSV(csv: string): string[] {
  if (!csv || csv.trim() === '') {
    return [];
  }

  return csv
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
}

export const foodUtils = {
  toCSV,
  fromCSV,
};
