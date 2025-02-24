class LoggingService {
    // Log levels
    static LEVELS = {
      ERROR: 'ERROR',
      WARN: 'WARN',
      INFO: 'INFO',
      DEBUG: 'DEBUG'
    };
  
    // Current log level based on environment
    static config = {
      logLevel: process.env.NODE_ENV === 'production' 
        ? this.LEVELS.WARN 
        : this.LEVELS.DEBUG
    };
  
    // Core logging method
    static log(level, message, metadata = {}) {
      // Only log if the current log level allows
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
  
      // Different handling based on environment
      if (process.env.NODE_ENV === 'production') {
        this.logToService(logEntry);
      } else {
        this.consoleLog(logEntry);
      }
    }
  
    // Console logging for development
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
  
    // Method to log to external service in production
    static logToService(logEntry) {
      // In a real-world scenario, this would send logs to a service
      if (navigator.onLine) {
        fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logEntry)
        }).catch(console.error);
      }
    }
  
    // Convenience methods for different log levels
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