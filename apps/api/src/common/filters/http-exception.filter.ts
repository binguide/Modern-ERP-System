import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = this.buildErrorResponse(exception, request, status);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} ${status} ${errorResponse.message}`);
    }

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
  ): Record<string, unknown> {
    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const body = typeof response === 'string' ? { message: response } : (response as object);
      return {
        statusCode: status,
        ...body,
        path,
        timestamp,
      };
    }

    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Unknown error';

    return {
      statusCode: status,
      message,
      error: 'Internal Server Error',
      path,
      timestamp,
    };
  }
}
