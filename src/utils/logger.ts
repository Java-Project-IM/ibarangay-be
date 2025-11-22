import fs from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logToFile(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    const logLine = JSON.stringify(logEntry) + "\n";
    const logFile = path.join(logsDir, `${level}.log`);

    // Append to log file
    fs.appendFile(logFile, logLine, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });

    // Also append to combined log
    const combinedLogFile = path.join(logsDir, "combined.log");
    fs.appendFile(combinedLogFile, logLine, (err) => {
      if (err) {
        console.error("Failed to write to combined log file:", err);
      }
    });
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
      debug: "🐛",
    };

    let formatted = `${emoji[level]} [${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      formatted += "\n" + JSON.stringify(data, null, 2);
    }

    return formatted;
  }

  info(message: string, data?: any): void {
    const formatted = this.formatMessage("info", message, data);
    console.log(formatted);

    if (process.env.NODE_ENV !== "test") {
      this.logToFile("info", message, data);
    }
  }

  warn(message: string, data?: any): void {
    const formatted = this.formatMessage("warn", message, data);
    console.warn(formatted);

    if (process.env.NODE_ENV !== "test") {
      this.logToFile("warn", message, data);
    }
  }

  error(message: string, data?: any): void {
    const formatted = this.formatMessage("error", message, data);
    console.error(formatted);

    if (process.env.NODE_ENV !== "test") {
      this.logToFile("error", message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.LOG_LEVEL === "debug"
    ) {
      const formatted = this.formatMessage("debug", message, data);
      console.debug(formatted);

      if (process.env.NODE_ENV !== "test") {
        this.logToFile("debug", message, data);
      }
    }
  }
}

export const logger = new Logger();
