const toFiniteNumber = (value: number | string | null | undefined) => {
  if (value == null) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const formatDecimal = (
  value: number | string | null | undefined,
): string => {
  const number = toFiniteNumber(value);
  return number == null ? 'N/A' : number.toFixed(1);
};

export const formatInteger = (
  value: number | string | null | undefined,
): string => {
  const number = toFiniteNumber(value);
  return number == null ? 'N/A' : Math.round(number).toString();
};

export const formatPercentage = (
  value: number | string | null | undefined,
): string => {
  const decimal = formatDecimal(value);
  return decimal === 'N/A' ? decimal : `${decimal}%`;
};

export const formatAge = (
  value: number | string | null | undefined,
): string => {
  const integer = formatInteger(value);
  return integer === 'N/A' ? integer : `${integer} years`;
};
