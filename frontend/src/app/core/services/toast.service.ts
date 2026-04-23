import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 1;

  success(title: string, message?: string, durationMs = 4000): void {
    this.push('success', title, message, durationMs);
  }

  error(title: string, message?: string, durationMs = 5000): void {
    this.push('error', title, message, durationMs);
  }

  info(title: string, message?: string, durationMs = 4000): void {
    this.push('info', title, message, durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(kind: ToastKind, title: string, message: string | undefined, durationMs: number): void {
    const id = this.nextId++;
    const toast: Toast = { id, kind, title, message, durationMs };
    this._toasts.update(list => [...list, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }
}