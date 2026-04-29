import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: "./toast-container.html",
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0);    }
    }
  `]
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);

  cardClass(kind: 'success' | 'error' | 'info'): string {
    switch (kind) {
      case 'success':
        return 'bg-bg-secondary text-accent border-accent/40';
      case 'error':
        return 'bg-bg-secondary text-badge-urgent-fg border-badge-urgent-fg/40';
      default:
        return 'bg-bg-secondary text-text-primary border-border-tertiary/50';
    }
  }
}