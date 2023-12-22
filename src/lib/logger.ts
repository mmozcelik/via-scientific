import { createLogger, format, transports } from 'winston';
import { extend } from 'lodash';
import { v4 as uuid } from 'uuid';

import clone from 'clone';
import stringify from 'json-stringify-safe';
import Transport from 'winston-transport';
import chalk from 'chalk';

const MESSAGE = Symbol.for('message');
const LEVEL = Symbol.for('level');

const COLOR_LEVELS = {
  debug: chalk.blue.bind(chalk),
  info: chalk.green.bind(chalk),
  warn: chalk.yellow.bind(chalk),
  error: chalk.red.bind(chalk),
};

export type LogData = {
  error?: Error;
  [key: string]: any;
};

export interface ILogTransport extends Transport {
  reCreate(): ILogTransport;
}

/**
 * What the full console log output looks like
 * ${info.timestamp} [${info.serviceName}] ${info.level.toUpperCase()}: ${info.message}
 * Data: {
 *  ...
 * }
 * Error: {
 *  name: ...
 *  code: ...
 *  message: ...
 * }
 * Stacktrace...
 *   ...
 *   ...
 */
const DEFAULT_LOG_FORMAT = format.printf((info) => {
  const log = {
    level: info.level.toUpperCase(),
    message: info.message,
    timestamp: info.timestamp, // CloudWatch already has a timestamp, maybe we may exclude this
    serviceName: null,
    data: null,
    error: null,
    stack: null,
  };

  if (info.serviceName) {
    log.serviceName = info.serviceName;
  }

  if (info.data) {
    if (info.data.error) {
      // We need a deep clone here so that we don't screw up other transports
      const data = clone(info.data, true, 10);

      // Remove error from data because it gets special treatment
      const { error } = data;
      delete data.error;

      // Stripe out stack from error because its big and hard to read in string form
      const { stack } = error;
      delete error.stack;
      log.data = data;
      log.error = error;

      // If stack exists add it on as a new line
      if (stack) {
        log.stack = stack;
      }
    } else {
      log.data = info.data;
    }
  }

  let logStr = stringify(log);
  logStr = `${info.message} - ${logStr}`;
  // Color the text according to log level
  const colorFn = COLOR_LEVELS[info.level];
  if (colorFn) {
    logStr = colorFn(logStr);
  }
  return logStr;
});

export function consoleTransport(
  {
    level,
    handleExceptions,
  }:
    {
      level?: string;
      handleExceptions?: boolean;
    } = {},
): Transport {
  level = level || 'info';
  handleExceptions = handleExceptions || true;
  return new transports.Console({
    level,
    stderrLevels: ['error'],
    format: format.combine(
      format.splat(),
      DEFAULT_LOG_FORMAT,
    ),
    handleExceptions,
    log(info, callback) {
      setImmediate(() => this.emit('logged', info));

      if (this.stderrLevels[info[LEVEL]]) {
        console.error(info[MESSAGE]);
      } else if (info[LEVEL] === 'warn') {
        console.warn(info[MESSAGE]);
      } else if (info[LEVEL] === 'debug') {
        console.debug(info[MESSAGE]);
      } else {
        console.log(info[MESSAGE]);
      }

      if (callback) {
        callback();
      }
    },
  });
}

export class Logger {
  readonly groupID?: string;

  private logger: any;

  private transports: ILogTransport[] = [];

  constructor({
    groupID,
    forceSimpleFormat,
  }: { groupID?: string, forceSimpleFormat?: boolean } = {}) {
    this.groupID = groupID;
    this.logger = this.createBasicLogger({ forceSimpleFormat });
  }

  createBasicLogger({ forceSimpleFormat }: { forceSimpleFormat?: boolean }): any {
    // default minimize logging to just error level
    let consoleLogLevel = 'error';

    // Check for custom set log level
    if (process.env.LOG_LEVEL) {
      consoleLogLevel = process.env.LOG_LEVEL;
    } else if (process.env.environment !== 'prod') {
      consoleLogLevel = 'debug';
    }
    let logFormat = format.combine(
      format.timestamp(),
      format.json(),
    );
    if (forceSimpleFormat) {
      logFormat = format.combine(
        format.timestamp(),
        format.simple(),
      );
    }
    return createLogger({
      format: logFormat,
      transports: [
        consoleTransport({
          level: consoleLogLevel,
          handleExceptions: true,
        }),
      ],
    });
  }

  debug(message: string, data?: LogData | string): string {
    return this.log('debug', message, data);
  }

  info(message: string, data?: LogData | string): string {
    return this.log('info', message, data);
  }

  warn(
    message: string,
    data?: LogData | Error,
  ): string {
    return this.log('warn', message, data);
  }

  error(
    message: string,
    data?: LogData | Error,
  ): string {
    return this.log('error', message, data);
  }

  log(level: string, message: string, data?: LogData | string): string {
    const logID = uuid();
    if (data) {
      data = this.formatError(data);
      data = this.cleanData(data);
    }
    this.logger.log({
      level,
      message,
      logID,
      data,
    });
    return logID;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  cleanData(data: any): any {
    let cleanData;
    try {
      cleanData = JSON.parse(stringify(data));
    } catch (err) {
      cleanData = `(JSON serialization failed: ${err.message})`;
    }

    return cleanData;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  formatError(paramData: any): any {
    const data = paramData;
    if (data.error && data.error instanceof Error) {
      try {
        data.error = extend(
          {},
          JSON.parse(stringify(data.error)),
          {
            stack: data.error.stack,
            message: data.error.message,
          },
        );
      } catch (err) {
        data.error = `(JSON serialization failed: ${err.message})`;
      }
    }
    return data;
  }
}
