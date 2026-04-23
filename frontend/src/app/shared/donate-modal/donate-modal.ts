import { Component, EventEmitter, Output, signal } from '@angular/core';

type Amount = 5 | 10 | 25 | 50 | 'custom';

@Component({
  selector: 'app-donate-modal',
  standalone: true,
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
         (click)="onBackdropClick()">

      <!-- Dialog -->
      <div class="relative w-full max-w-[480px]
                  bg-bg-primary border border-border-tertiary/50 rounded-xl
                  p-7 max-sm:p-5"
           (click)="$event.stopPropagation()"
           role="dialog" aria-modal="true" aria-labelledby="donate-title">

        <!-- Close button -->
        <button type="button" (click)="close()"
                aria-label="Close"
                class="absolute top-3 right-3 w-8 h-8 rounded-full
                       text-text-muted hover:text-text-primary hover:bg-bg-secondary
                       transition-colors text-lg leading-none">
          ✕
        </button>

        <!-- Icon + heading -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full
                      bg-accent/15 text-accent mb-3">
            <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-10-9.1C.3 8.4 2.1 4.5 5.7 4.5c2 0 3.6 1 4.3 2.3h2c.7-1.3 2.3-2.3 4.3-2.3 3.6 0 5.4 3.9 3.7 7.4C19.5 16.4 12 21 12 21z"/>
            </svg>
          </div>
          <h2 id="donate-title" class="text-2xl font-medium text-text-primary mb-2">
            Support PawID
          </h2>
          <p class="text-sm text-text-secondary leading-relaxed">
            Your donation helps feed, vaccinate, and rehome the dogs in our registry.
            Every amount makes a difference.
          </p>
        </div>

        <!-- Amount chips -->
        <div class="flex flex-col gap-2 mb-5">
          <label class="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Choose amount (EUR)
          </label>
          <div class="grid grid-cols-4 gap-2">
            @for (a of presetAmounts; track a) {
              <button type="button"
                      (click)="selectAmount(a)"
                      [class]="chipClass(a)">
                €{{ a }}
              </button>
            }
          </div>
          <button type="button"
                  (click)="selectAmount('custom')"
                  [class]="chipClass('custom')"
                  class="mt-1">
            Custom amount
          </button>
        </div>

        <!-- Custom amount input (only when 'custom' is selected) -->
        @if (selected() === 'custom') {
          <div class="flex flex-col gap-1.5 mb-5">
            <label class="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Enter amount
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">€</span>
              <input type="number" min="1" step="1"
                     [value]="customAmount()"
                     (input)="onCustomInput($event)"
                     placeholder="0"
                     class="input pl-7 w-full" />
            </div>
          </div>
        }

        <!-- Donate button -->
        <button type="button"
                (click)="onDonate()"
                [disabled]="!isValid()"
                class="btn-primary w-full justify-center rounded-full
                       disabled:opacity-50 disabled:cursor-not-allowed">
          Donate {{ displayAmount() ? '€' + displayAmount() : '' }}
        </button>

        <p class="text-xs text-text-muted text-center mt-4">
          Secure payment · Cancel anytime
        </p>
      </div>
    </div>
  `
})
export class DonateModalComponent {

  @Output() closed = new EventEmitter<void>();
  @Output() donated = new EventEmitter<number>();

  readonly presetAmounts: Amount[] = [5, 10, 25, 50];

  readonly selected = signal<Amount | null>(null);
  readonly customAmount = signal<number | null>(null);

  displayAmount(): number | null {
    const sel = this.selected();
    if (sel === null)      return null;
    if (sel === 'custom')  return this.customAmount();
    return sel;
  }

  isValid(): boolean {
    const amt = this.displayAmount();
    return amt !== null && amt > 0;
  }

  chipClass(a: Amount): string {
    const base = 'px-3 py-2.5 rounded-md text-sm font-medium border transition-colors';
    return this.selected() === a
      ? `${base} bg-accent text-white border-accent`
      : `${base} bg-bg-secondary text-text-primary border-border-tertiary/50 hover:border-accent`;
  }

  selectAmount(a: Amount): void {
    this.selected.set(a);
    if (a !== 'custom') {
      this.customAmount.set(null);
    }
  }

  onCustomInput(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.customAmount.set(isNaN(value) ? null : value);
  }

  onDonate(): void {
    const amt = this.displayAmount();
    if (amt && amt > 0) {
      this.donated.emit(amt);
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.closed.emit();
  }
}