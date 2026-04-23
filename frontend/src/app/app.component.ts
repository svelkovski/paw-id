import { Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { HeaderComponent } from "./shared/header/header.component";
import { ToastContainerComponent } from "./shared/toast-container/toast-container";
import { FooterComponent } from "./shared/footer/footer.component";
@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    ToastContainerComponent,
    FooterComponent,
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent {}
