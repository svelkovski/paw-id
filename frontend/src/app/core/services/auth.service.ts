import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';

const API_BASE = 'http://localhost:8080';
const TOKEN_KEY = 'pawid_token';
const USER_KEY  = 'pawid_user';

export interface AuthUser {
  userId: number;
  email: string;
  displayName: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  displayName: string;
}

export interface TopContributor {
  userId: number;
  displayName: string;
  sightingCount: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);

  // --- reactive state ---
  private readonly _user = signal<AuthUser | null>(this.loadUser());
  readonly user   = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  // --- auth calls ---

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/api/auth/register`, req).pipe(
      tap(res => this.persist(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/api/auth/login`, req).pipe(
      tap(res => this.persist(res))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getTopContributor(): Observable<TopContributor> {
    return this.http.get<TopContributor>(`${API_BASE}/api/stats/top-contributor`);
  }

  // --- private helpers ---

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: AuthUser = { userId: res.userId, email: res.email, displayName: res.displayName };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
