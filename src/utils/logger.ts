import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'reports');

// Create reports directory with error handling
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  console.warn('Warning: Could not create reports directory:', error);
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack ? `${timestamp} [${level}] ${message}\n${stack}` : `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] ${message}`;
        })
      )
    }),
    // File transport with error handling
    ...((() => {
      try {
        const fileTransport = new winston.transports.File({
          filename: path.join(logsDir, `logs-${process.pid}.log`),
          maxsize: 5242880,
          maxFiles: 5,
          tailable: true
        });

        fileTransport.on('error', (error) => {
          console.warn('Warning: File logger failed:', error);
        });

        return [fileTransport];
      } catch (error) {
        console.warn('Warning: File transport could not be configured:', error);
        return [];
      }
    })())
  ]
});
