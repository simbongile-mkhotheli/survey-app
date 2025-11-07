// backend/src/errors/AppError.ts
/**
 * Base application error class following Open/Closed Principle
 * Allows extending with specific error types without modifying existing code
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation?: string) {
    const fullMessage = operation ? `Database ${operation} failed: ${message}` : message;
    super(fullMessage, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * Business logic error
 */
export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'BusinessError';
  }
}