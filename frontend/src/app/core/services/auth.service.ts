import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { AuthResponse } from "../models/auth/auth-response.model";
import { AuthUser } from "../models/auth/auth-user.model";
import { LoginRequest } from "../models/auth/login-request.model";
import { RegisterRequest } from "../models/auth/register-request.model";

const API_BASE = "http://localhost:8080";
const TOKEN_KEY = "jwt_token";
const USER_KEY = "pawid_user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<AuthUser | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  private readonly router = inject(Router);

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/api/auth/register`, req)
      .pipe(tap((res) => this.persist(res)));
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/api/auth/login`, req)
      .pipe(tap((res) => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(["login"]);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: AuthUser = {
      userId: res.userId,
      email: res.email,
      displayName: res.displayName,
    };
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
