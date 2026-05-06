export function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export const dateUtils = {
  format: formatDate,
  parse: parseDate,
};
