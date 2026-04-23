import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page flex items-center justify-center min-h-[calc(100vh-58px-60px)]">
  <div class="w-full max-w-[640px] p-8 max-sm:p-6">

    <div class="mb-10">
      <h1 class="text-4xl font-medium text-text-primary mb-3">Welcome back</h1>
      <p class="text-base text-text-secondary">Sign in to report sightings under your name.</p>
    </div>

    @if (errorMsg()) {
      <div class="mb-6 px-4 py-3 rounded-lg text-sm
                  bg-badge-urgent-fg/10 text-badge-urgent-fg border border-badge-urgent-fg/20">
        {{ errorMsg() }}
      </div>
    }

    <form (ngSubmit)="submit()" class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-text-secondary uppercase tracking-wider">Email</label>
        <input type="email" [(ngModel)]="email" name="email" required
               placeholder="you@example.com"
               class="input text-base py-3" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-text-secondary uppercase tracking-wider">Password</label>
        <input type="password" [(ngModel)]="password" name="password" required
               placeholder="••••••••"
               class="input text-base py-3" />
      </div>

      <div class="flex justify-center mt-4 text-center">
        <button type="submit"
                class="btn-primary w-[220px] rounded-full text-base text-center justify-center"
                [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
      </div>
    </form>

    <p class="text-base text-text-secondary text-center mt-8">
      No account?
      <a routerLink="/register" class="text-accent hover:text-accent-dark transition-colors ml-1">
        Create one →
      </a>
    </p>
  </div>
</section>
  `
})
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  email    = '';
  password = '';
  loading  = signal(false);
  errorMsg = signal<string | null>(null);

  submit(): void {
    this.errorMsg.set(null);
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        this.errorMsg.set(err?.status === 401 ? 'Invalid email or password.' : 'Something went wrong.');
        this.loading.set(false);
      }
    });
  }
}
