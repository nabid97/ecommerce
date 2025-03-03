// src/services/LoggingService.js
class LoggingService {
  static LEVELS = {
      ERROR: 'ERROR',
      WARN: 'WARN',
      INFO: 'INFO',
      DEBUG: 'DEBUG'
  };

  static config = {
      logLevel: process.env.NODE_ENV === 'production' 
          ? this.LEVELS.WARN 
          : this.LEVELS.DEBUG
  };

  static log(level, message, metadata = {}) {
      const logLevels = Object.values(this.LEVELS);
      const currentLevelIndex = logLevels.indexOf(this.config.logLevel);
      const messageLevelIndex = logLevels.indexOf(level);

      if (messageLevelIndex > currentLevelIndex) return;

      const logEntry = {
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

  static consoleLog(logEntry) {
      const consoleMethod = {
          [this.LEVELS.ERROR]: 'error',
          [this.LEVELS.WARN]: 'warn',
          [this.LEVELS.INFO]: 'info',
          [this.LEVELS.DEBUG]: 'log'
      }[logEntry.level];

      console[consoleMethod](
          `[${logEntry.level}] ${logEntry.message}`,
          logEntry.metadata
      );
  }

  static async logToService(logEntry) {
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

  static error(message, metadata = {}) {
      this.log(this.LEVELS.ERROR, message, metadata);
  }

  static warn(message, metadata = {}) {
      this.log(this.LEVELS.WARN, message, metadata);
  }

  static info(message, metadata = {}) {
      this.log(this.LEVELS.INFO, message, metadata);
  }

  static debug(message, metadata = {}) {
      this.log(this.LEVELS.DEBUG, message, metadata);
  }
}

export default LoggingService;