import { Component, HostListener, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, NavigationEnd, Router } from "@angular/router";
import { LogoComponent } from "../logo/logo.component";
import { AuthService } from "../../core/services/auth.service";
import { filter } from 'rxjs/operators';
@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: "./header.component.html",
  host: {
    class:
      "sticky top-0 z-30 block bg-bg-primary border-b border-border-tertiary/50",
  },
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768 && this.menuOpen()) {
      this.closeMenu();
    }
  }
}
