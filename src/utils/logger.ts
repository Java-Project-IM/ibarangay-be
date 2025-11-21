import morgan from "morgan";

/**
 * Custom logger utility for consistent logging across the application
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || "");
  }

  error(
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>
  ): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error instanceof Error) {
      console.error(`Stack: ${error.stack}`);
    }
    if (meta) {
      console.error("Meta:", meta);
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || "");
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        meta || ""
      );
    }
  }

  /**
   * Get Morgan middleware for HTTP request logging
   */
  getHttpLogger() {
    const format = this.isDevelopment ? "dev" : "combined";
    return morgan(format);
  }
}

export default new Logger();
