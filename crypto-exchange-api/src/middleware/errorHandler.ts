import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'joi';
import { ExolixError } from '../types/exolix';
import { ErrorResponse } from '../types/api';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Joi validation errors
  if (error.name === 'ValidationError') {
    const validationError = error as ValidationError;
    errorResponse.error = 'Validation Error';
    errorResponse.details = validationError.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    res.status(400).json(errorResponse);
    return;
  }

  // Exolix API errors
  if (error instanceof ExolixError) {
    errorResponse.error = error.message;
    
    // Map Exolix error codes to HTTP status codes
    let statusCode = 500;
    switch (error.code) {
      case '400':
        statusCode = 400;
        break;
      case '401':
      case 'UNAUTHORIZED':
        statusCode = 401;
        break;
      case '403':
        statusCode = 403;
        break;
      case '404':
        statusCode = 404;
        break;
      case '429':
        statusCode = 429;
        break;
      default:
        statusCode = 500;
    }
    
    res.status(statusCode).json(errorResponse);
    return;
  }

  // Network/timeout errors
  if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
    errorResponse.error = 'Service temporarily unavailable';
    res.status(503).json(errorResponse);
    return;
  }

  // Default error response
  res.status(500).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  };
  
  res.status(404).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};