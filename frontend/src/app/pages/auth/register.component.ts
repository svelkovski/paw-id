import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page flex items-center justify-center min-h-[calc(100vh-58px-60px)]">
      <div class="w-full max-w-[400px]">
        <h1 class="text-2xl font-medium text-text-primary mb-1">Create an account</h1>
        <p class="text-sm text-text-secondary mb-8">Your name will appear on every sighting you report.</p>

        @if (errorMsg()) {
          <div class="mb-4 px-4 py-3 rounded-lg text-sm
                      bg-badge-urgent-fg/10 text-badge-urgent-fg border border-badge-urgent-fg/20">
            {{ errorMsg() }}
          </div>
        }

        <form (ngSubmit)="submit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-text-secondary uppercase tracking-wider">Display name</label>
            <input type="text" [(ngModel)]="displayName" name="displayName" required
                   placeholder="e.g. Maria K."
                   class="input" />
            <span class="text-xs text-text-muted">Shown publicly next to your sightings</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-text-secondary uppercase tracking-wider">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   placeholder="you@example.com"
                   class="input" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-text-secondary uppercase tracking-wider">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   minlength="6" placeholder="min. 6 characters"
                   class="input" />
          </div>

          <button type="submit" class="btn-primary mt-2" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="text-sm text-text-secondary text-center mt-6">
          Already have an account?
          <a routerLink="/login" class="text-accent hover:text-accent-dark transition-colors ml-1">
            Sign in →
          </a>
        </p>
      </div>
    </section>
  `
})
export class RegisterComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  displayName = '';
  email       = '';
  password    = '';
  loading     = signal(false);
  errorMsg    = signal<string | null>(null);

  submit(): void {
    this.errorMsg.set(null);
    this.loading.set(true);
    this.auth.register({ displayName: this.displayName, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        this.errorMsg.set(err?.status === 409 ? 'This email is already registered.' : 'Something went wrong.');
        this.loading.set(false);
      }
    });
  }
}
