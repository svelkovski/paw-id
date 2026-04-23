import { Component, EventEmitter, Output, signal } from '@angular/core';

type Amount = 5 | 10 | 25 | 50 | 'custom';

@Component({
  selector: 'app-donate-modal',
  standalone: true,
  templateUrl: './donate-modal.html' 
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