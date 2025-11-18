type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  private log(level: LogLevel, message: string, extra?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...extra },
    };

    const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

    if (process.env.NODE_ENV === "production") {
      // In production, output JSON for log aggregators
      logFn(JSON.stringify(entry));
    } else {
      // In development, pretty print
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}:`;
      if (extra && Object.keys(extra).length > 0) {
        logFn(prefix, message, extra);
      } else {
        logFn(prefix, message);
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development" || process.env.LOG_LEVEL === "debug") {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      context: { ...this.context, ...context },
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      entry.error = {
        name: "Unknown Error",
        message: String(error),
      };
    }

    if (process.env.NODE_ENV === "production") {
      console.error(JSON.stringify(entry));
    } else {
      console.error(`[${entry.timestamp}] ERROR:`, message, error);
      if (context) {
        console.error("Context:", context);
      }
    }
  }

  // Create a child logger with additional context
  child(context: LogContext): Logger {
    const child = new Logger();
    child.setContext({ ...this.context, ...context });
    return child;
  }
}

// Singleton instance
export const logger = new Logger();

// Helper to create request-scoped loggers
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({ requestId, userId });
}
