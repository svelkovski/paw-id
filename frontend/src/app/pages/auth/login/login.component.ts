import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = "";
  password = "";
  loading = false;
  errorMsg: string | null = null;

  submit(): void {
    this.errorMsg = null;
    this.loading = false;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate([""]),
      error: (err) => {
        this.errorMsg =
          err?.status === 401
            ? "Invalid email or password."
            : "Something went wrong.";
            
        this.loading = false;
      },
    });
  }
}
