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
  <div class="w-full max-w-[640px] p-8 max-sm:p-6">

    <div class="mb-10">
      <h1 class="text-4xl font-medium text-text-primary mb-3">Create an account</h1>
      <p class="text-base text-text-secondary">Your name will appear on every sighting you report.</p>
    </div>

    @if (errorMsg()) {
      <div class="mb-6 px-4 py-3 rounded-lg text-sm
                  bg-badge-urgent-fg/10 text-badge-urgent-fg border border-badge-urgent-fg/20">
        {{ errorMsg() }}
      </div>
    }

    <form (ngSubmit)="submit()" class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-text-secondary uppercase tracking-wider">Display name</label>
        <input type="text" [(ngModel)]="displayName" name="displayName" required
               placeholder="e.g. Maria K."
               class="input text-base py-3" />
        <span class="text-sm text-text-muted">Shown publicly next to your sightings</span>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-text-secondary uppercase tracking-wider">Email</label>
        <input type="email" [(ngModel)]="email" name="email" required
               placeholder="you@example.com"
               class="input text-base py-3" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-text-secondary uppercase tracking-wider">Password</label>
        <input type="password" [(ngModel)]="password" name="password" required
               minlength="6" placeholder="min. 6 characters"
               class="input text-base py-3" />
      </div>

      <div class="flex justify-center mt-4">
        <button type="submit"
                class="btn-primary w-[240px] rounded-full text-base text-center justify-center"
                [disabled]="loading()">
          {{ loading() ? 'Creating account…' : 'Create account' }}
        </button>
      </div>
    </form>

    <p class="text-base text-text-secondary text-center mt-8">
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
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal<string | null>(null);

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
