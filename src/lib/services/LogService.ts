export class LogService {
  error(context: string, details: Record<string, any>): void {
    console.error(`[${context}] Error:`, JSON.stringify(details));
  }

  info(context: string, message: string): void {
    console.info(`[${context}] Info:`, message);
  }

  warn(context: string, message: string): void {
    console.warn(`[${context}] Warning:`, message);
  }
}

export const logService = new LogService();
