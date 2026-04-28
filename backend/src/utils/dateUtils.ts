export function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function formatDatetime(date: Date | string): string {
  return new Date(date).toISOString();
}

export function calculateAge(dateOfBirth: Date | string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getElapsedTime(
  startDate: Date | string,
  endDate: Date | string = new Date(),
): number {
  return new Date(endDate).getTime() - new Date(startDate).getTime();
}

export const dateUtils = {
  format: formatDate,
  formatDatetime,
  parse: parseDate,
  calculateAge,
  getElapsedTime,
};
