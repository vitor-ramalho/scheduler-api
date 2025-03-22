import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

interface DatabaseErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Catch(TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';
    let error = 'Internal Server Error';

    // Handle specific TypeORM errors with more appropriate status codes
    if (exception instanceof QueryFailedError) {
      this.logger.error(`Query failed: ${exception.message}`, exception.stack);
      
      // You can extract the specific error code and customize based on the database
      const pgError = exception as unknown as { code: string };
      
      if (pgError.code === '23505') { // Unique violation
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        error = 'Conflict';
      } else if (pgError.code === '23503') { // Foreign key violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Related resource not found';
        error = 'Bad Request';
      }
    } else if (exception instanceof EntityNotFoundError) {
      this.logger.error(`Entity not found: ${exception.message}`, exception.stack);
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'Not Found';
    } else {
      // Generic TypeORM error
      this.logger.error(`Database error: ${exception.message}`, exception.stack);
    }

    // Send JSON response
    const responseBody: DatabaseErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
    };

    response.status(status).json(responseBody);
  }
} 