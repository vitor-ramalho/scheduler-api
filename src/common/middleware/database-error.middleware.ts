import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class DatabaseErrorMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DatabaseErrorMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      if (error instanceof QueryFailedError) {
        this.logger.error('Database query failed', error.stack);
        res.status(503).json({
          statusCode: 503,
          message: 'Database service unavailable',
          error: 'Service Unavailable',
        });
      } else {
        next(error);
      }
    }
  }
} 