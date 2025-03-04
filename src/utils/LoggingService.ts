// src/utils/LoggingService.ts

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, any>;
}

interface LoggingConfig {
  logLevel: LogLevel;
}

class LoggingService {
  static readonly LEVELS: Record<string, LogLevel> = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
  };

  static config: LoggingConfig = {
    logLevel: (process.env.NODE_ENV === 'production' 
      ? this.LEVELS.WARN 
      : this.LEVELS.DEBUG) as LogLevel
  };

  static log(level: LogLevel, message: string, metadata: Record<string, any> = {}): void {
    const logLevels = Object.values(this.LEVELS);
    const currentLevelIndex = logLevels.indexOf(this.config.logLevel);
    const messageLevelIndex = logLevels.indexOf(level);

    if (messageLevelIndex > currentLevelIndex) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    };

    if (process.env.NODE_ENV === 'production') {
      this.logToService(logEntry);
    } else {
      this.consoleLog(logEntry);
    }
  }

  static consoleLog(logEntry: LogEntry): void {
    const consoleMethod: Record<LogLevel, keyof typeof console> = {
      'ERROR': 'error',
      'WARN': 'warn',
      'INFO': 'info',
      'DEBUG': 'log'
    };

    const method = consoleMethod[logEntry.level];
    console[method](
      `[${logEntry.level}] ${logEntry.message}`,
      logEntry.metadata
    );
  }

  static async logToService(logEntry: LogEntry): Promise<void> {
    try {
      // Use the same base URL as your API (assuming it's set in api.js)
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      if (navigator.onLine) {
        await fetch(`${API_URL}/api/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logEntry)
        });
      }
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  static error(message: string, metadata: Record<string, any> = {}): void {
    this.log(this.LEVELS.ERROR, message, metadata);
  }

  static warn(message: string, metadata: Record<string, any> = {}): void {
    this.log(this.LEVELS.WARN, message, metadata);
  }

  static info(message: string, metadata: Record<string, any> = {}): void {
    this.log(this.LEVELS.INFO, message, metadata);
  }

  static debug(message: string, metadata: Record<string, any> = {}): void {
    this.log(this.LEVELS.DEBUG, message, metadata);
  }
}

export default LoggingService;