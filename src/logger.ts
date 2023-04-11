import { type PinoLoggerOptions } from 'fastify/types/logger'
import { environment } from '../lib/environment'

enum PinoLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
  fatal = 'fatal',
}

const PinoLevelToSeverityLookup: Record<PinoLevel, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
}

export const logger: PinoLoggerOptions = {
  transport: environment.PRETTY_LOGS
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      }
    : undefined,
  level: environment.LOG_LEVEL,
  messageKey: 'message',
  formatters: {
    level(label, number) {
      // The pino library uses a string for the label, and unfortunately
      // does not exports the label enum so we have to
      const level = label as PinoLevel
      const severity: string =
        label in PinoLevelToSeverityLookup
          ? PinoLevelToSeverityLookup[level]
          : PinoLevelToSeverityLookup.info
      return {
        severity,
        level: number,
      }
    },
  },
}
