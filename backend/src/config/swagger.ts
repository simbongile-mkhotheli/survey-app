// backend/src/config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import { config } from '@/config/env';

/**
 * OpenAPI 3.0 Configuration for Survey API
 * Provides comprehensive API documentation with interactive UI
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Survey Application API',
    version: '1.0.0',
    description: `
      A comprehensive survey application API built with Express, TypeScript, and Prisma.
      
      ## Features
      - Submit survey responses with personal information and ratings
      - Retrieve aggregated survey results and analytics
      - Comprehensive input validation and security measures
      - Rate limiting and CORS protection
      
      ## Architecture
      - **Framework**: Express.js with TypeScript
      - **Database**: PostgreSQL with Prisma ORM
      - **Validation**: Zod schemas with express-validator
      - **Security**: Helmet, CORS, Rate limiting, Input sanitization
      
      ## Authentication
      Currently, this API does not require authentication. All endpoints are publicly accessible
      but protected by rate limiting and input validation.
    `,
    contact: {
      name: 'Survey API Support',
      email: 'support@survey-app.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}`,
      description: 'Development server',
    },
    {
      url: 'https://api.survey-app.com',
      description: 'Production server',
    },
  ],
  components: {
    schemas: {
      SurveyInput: {
        type: 'object',
        required: [
          'firstName',
          'lastName',
          'email',
          'contactNumber',
          'dateOfBirth',
          'foods',
          'ratingMovies',
          'ratingRadio',
          'ratingEatOut',
          'ratingTV',
        ],
        properties: {
          firstName: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'First name of the respondent',
            example: 'John',
          },
          lastName: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Last name of the respondent',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 255,
            description: 'Email address of the respondent',
            example: 'john.doe@example.com',
          },
          contactNumber: {
            type: 'string',
            pattern: '^\\+?\\d{10,15}$',
            description: 'Phone number with optional country code',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'Date of birth (must result in age between 5-120 years)',
            example: '1990-05-15',
          },
          foods: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['pizza', 'pasta', 'papAndWors'],
            },
            minItems: 1,
            maxItems: 3,
            description: 'Preferred food choices',
            example: ['pizza', 'pasta'],
          },
          ratingMovies: {
            type: 'string',
            pattern: '^[1-5]$',
            description: 'Rating for movies (1-5 scale)',
            example: '4',
          },
          ratingRadio: {
            type: 'string',
            pattern: '^[1-5]$',
            description: 'Rating for radio (1-5 scale)',
            example: '3',
          },
          ratingEatOut: {
            type: 'string',
            pattern: '^[1-5]$',
            description: 'Rating for eating out (1-5 scale)',
            example: '5',
          },
          ratingTV: {
            type: 'string',
            pattern: '^[1-5]$',
            description: 'Rating for TV (1-5 scale)',
            example: '2',
          },
        },
        additionalProperties: false,
      },
      SurveyResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Unique identifier for the created survey response',
            example: 123,
          },
        },
        required: ['id'],
      },
      ResultsData: {
        type: 'object',
        properties: {
          totalCount: {
            type: 'number',
            description: 'Total number of survey responses',
            example: 150,
          },
          age: {
            type: 'object',
            properties: {
              avg: {
                type: 'number',
                nullable: true,
                description: 'Average age of respondents',
                example: 28.5,
              },
              min: {
                type: 'number',
                nullable: true,
                description: 'Minimum age of respondents',
                example: 18,
              },
              max: {
                type: 'number',
                nullable: true,
                description: 'Maximum age of respondents',
                example: 65,
              },
            },
            required: ['avg', 'min', 'max'],
          },
          foodPercentages: {
            type: 'object',
            properties: {
              pizza: {
                type: 'number',
                nullable: true,
                description: 'Percentage of respondents who chose pizza',
                example: 45.5,
              },
              pasta: {
                type: 'number',
                nullable: true,
                description: 'Percentage of respondents who chose pasta',
                example: 30.2,
              },
              papAndWors: {
                type: 'number',
                nullable: true,
                description: 'Percentage of respondents who chose pap and wors',
                example: 24.3,
              },
            },
            required: ['pizza', 'pasta', 'papAndWors'],
          },
          avgRatings: {
            type: 'object',
            properties: {
              movies: {
                type: 'number',
                nullable: true,
                description: 'Average rating for movies',
                example: 4.2,
              },
              radio: {
                type: 'number',
                nullable: true,
                description: 'Average rating for radio',
                example: 3.1,
              },
              eatOut: {
                type: 'number',
                nullable: true,
                description: 'Average rating for eating out',
                example: 4.8,
              },
              tv: {
                type: 'number',
                nullable: true,
                description: 'Average rating for TV',
                example: 3.5,
              },
            },
            required: ['movies', 'radio', 'eatOut', 'tv'],
          },
        },
        required: ['totalCount', 'age', 'foodPercentages', 'avgRatings'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Human-readable error message',
                example: 'Validation failed',
              },
              type: {
                type: 'string',
                description: 'Error type identifier',
                example: 'ValidationError',
              },
              details: {
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                description: 'Detailed validation errors by field',
                example: {
                  email: ['Invalid email address'],
                  age: ['Age must be between 5 and 120 years'],
                },
              },
            },
            required: ['message', 'type'],
          },
        },
        required: ['error'],
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Validation failed',
                type: 'ValidationError',
                details: {
                  email: ['Invalid email address'],
                  ratingMovies: ['Please select a rating from 1–5'],
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'An unexpected error occurred',
                type: 'InternalError',
              },
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Too Many Requests - Rate limit exceeded',
        headers: {
          'X-RateLimit-Limit': {
            schema: {
              type: 'integer',
            },
            description: 'Request limit per window',
          },
          'X-RateLimit-Remaining': {
            schema: {
              type: 'integer',
            },
            description: 'Remaining requests in current window',
          },
          'X-RateLimit-Reset': {
            schema: {
              type: 'integer',
            },
            description: 'Time when rate limit resets (Unix timestamp)',
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Too many requests, please try again later.',
                type: 'RateLimitError',
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Not Found - Endpoint does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: {
                message: 'Not Found',
                type: 'NotFoundError',
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      // Future authentication schemes can be added here
    },
  },
  tags: [
    {
      name: 'Survey',
      description: 'Survey submission operations',
    },
    {
      name: 'Results',
      description: 'Survey results and analytics operations',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/types/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerDefinition };