import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } =
  winston.format;

const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

export const logger = winston.createLogger({
  level: 'debug',
  format:     
       combine(
          colorize(),
          timestamp({ format: 'HH:mm:ss' }),
          devFormat
        ),
  transports: [new winston.transports.Console()],
});
