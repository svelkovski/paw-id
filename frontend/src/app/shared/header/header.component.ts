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

  // Controls the mobile burger panel.
  readonly menuOpen = signal(false);

  constructor() {
    // Close the menu whenever the route changes — otherwise it stays open
    // after clicking a link inside it.
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

  /**
   * Close the menu if the viewport grows past the md breakpoint (768px) —
   * otherwise resizing from mobile to desktop leaves a stale open panel.
   */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768 && this.menuOpen()) {
      this.closeMenu();
    }
  }
}
