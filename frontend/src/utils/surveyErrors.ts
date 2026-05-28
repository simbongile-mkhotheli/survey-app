export const formatErrorMessage = (error: Error | string): string => {
  const message = typeof error === 'string' ? error : error.message;
  const normalized = message.toLowerCase();

  if (normalized.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (normalized.includes('validation')) {
    return 'Please correct the errors below and try again.';
  }

  return message || 'Failed to submit survey. Please try again.';
};
