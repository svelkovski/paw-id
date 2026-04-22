import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  displayName = "";
  email = "";
  password = "";
  loading = false;
  errorMsg: string | null = null;

  submit(): void {
    this.errorMsg = null;
    this.loading = true;

    this.auth
      .register({
        displayName: this.displayName,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => this.router.navigate([""]),
        error: (err) => {
          this.errorMsg =
            err?.status === 409
              ? "This email is already registered."
              : "Something went wrong.";

          this.loading = false;
        },
      });
  }
}
