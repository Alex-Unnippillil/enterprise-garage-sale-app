import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];

  private log(level: 'info' | 'warn' | 'error', message: string, req?: Request, res?: Response) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      method: req?.method,
      url: req?.url,
      statusCode: res?.statusCode,
      responseTime: req && res ? Date.now() - (req as any).startTime : undefined,
      userAgent: req?.get('User-Agent'),
      ip: req?.ip || req?.connection?.remoteAddress,
      userId: (req as any)?.user?.id,
    };

    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Console output
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    if (level === 'error') {
      console.error(logMessage);
    } else if (level === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Add start time to request
      (req as any).startTime = Date.now();

      // Log request
      this.log('info', `Request: ${req.method} ${req.url}`, req);

      // Override res.end to log response
      const originalEnd = res.end;
      (res as any).end = function(this: Response, chunk?: any, encoding?: any, cb?: any) {
        const responseTime = Date.now() - (req as any).startTime;
        
        // Log response
        const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
        const message = `Response: ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`;
        
        // Access logger instance through req.app.locals or create a new one
        const logger = new Logger();
        logger.log(level, message, req, res);

        return originalEnd.call(this, chunk, encoding, cb);
      };

      next();
    };
  }

  morganMiddleware() {
    return morgan('combined', {
      stream: {
        write: (message: string) => {
          this.log('info', message.trim());
        }
      }
    });
  }

  errorLogger() {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      this.log('error', `Unhandled error: ${err.message}`, req, res);
      this.log('error', `Stack trace: ${err.stack}`);
      next(err);
    };
  }

  info(message: string, req?: Request) {
    this.log('info', message, req);
  }

  warn(message: string, req?: Request) {
    this.log('warn', message, req);
  }

  error(message: string, req?: Request) {
    this.log('error', message, req);
  }

  getLogs(level?: 'info' | 'warn' | 'error', limit: number = 100) {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    return filteredLogs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export default new Logger(); 