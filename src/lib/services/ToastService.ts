import { z } from 'zod';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export const ToastSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  type: z.nativeEnum(ToastType),
  duration: z.number().min(1000).max(10000).default(3000)
});

export class ToastService {
  private static toasts: z.infer<typeof ToastSchema>[] = [];
  private static listeners: ((toasts: z.infer<typeof ToastSchema>[]) => void)[] = [];

  static show(
    message: string, 
    type: ToastType = ToastType.INFO, 
    duration: number = 3000
  ): string {
    const toast: z.infer<typeof ToastSchema> = {
      id: crypto.randomUUID(),
      message,
      type,
      duration
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-remove toast
    setTimeout(() => {
      this.remove(toast.id);
    }, duration);

    return toast.id;
  }

  static remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  static subscribe(listener: (toasts: z.infer<typeof ToastSchema>[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.toasts));
  }

  // Convenience methods
  static success(message: string, duration?: number): string {
    return this.show(message, ToastType.SUCCESS, duration);
  }

  static error(message: string, duration?: number): string {
    return this.show(message, ToastType.ERROR, duration);
  }

  static warning(message: string, duration?: number): string {
    return this.show(message, ToastType.WARNING, duration);
  }

  static info(message: string, duration?: number): string {
    return this.show(message, ToastType.INFO, duration);
  }
}

export const toastService = ToastService;
